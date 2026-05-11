import { handleApiError, HttpError, json } from '../_lib/http';
import { getSupabaseAdmin } from '../_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

type ReminderSchedule = {
  everyMinutes?: number;
  inactivityDays?: number;
  time?: string;
  timezone?: string;
};

type DeliveryInput = {
  user_id: string;
  channel: 'push' | 'email' | 'whatsapp' | 'in_app' | 'webhook';
  source_table: string;
  source_id?: string | null;
  subject: string;
  body: string;
  scheduled_for?: string;
};

function verifyWorkerAuth(request: Request): void {
  const secret = process.env.RETENTION_WORKER_SECRET || process.env.CRON_SECRET;

  if (!secret && process.env.NODE_ENV === 'production') {
    throw new HttpError(500, 'RETENTION_WORKER_SECRET or CRON_SECRET is not configured');
  }

  if (!secret) return;

  const expected = `Bearer ${secret}`;
  if (request.headers.get('authorization') !== expected) {
    throw new HttpError(401, 'Unauthorized retention worker request');
  }
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

function getNextReminderRun(schedule: ReminderSchedule, now: Date): string {
  if (schedule.everyMinutes && schedule.everyMinutes >= 15) {
    return addMinutes(now, schedule.everyMinutes).toISOString();
  }

  return addDays(now, 1).toISOString();
}

function getInactiveDays(lastActivityDate?: string | null): number | null {
  if (!lastActivityDate) return null;

  const last = new Date(`${lastActivityDate.slice(0, 10)}T00:00:00.000Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return Math.max(0, Math.floor((today.getTime() - last.getTime()) / 86_400_000));
}

async function deliverNotification(input: DeliveryInput): Promise<'queued' | 'sent' | 'failed'> {
  const supabase = getSupabaseAdmin();
  const webhookUrl = process.env.RETENTION_NOTIFICATION_WEBHOOK_URL;

  const { data: delivery, error: insertError } = await supabase
    .from('notification_deliveries')
    .insert({
      ...input,
      status: webhookUrl ? 'queued' : input.channel === 'in_app' ? 'sent' : 'queued',
      provider: webhookUrl ? 'webhook' : input.channel === 'in_app' ? 'in_app' : 'external_pending',
      scheduled_for: input.scheduled_for ?? new Date().toISOString(),
      sent_at: webhookUrl ? null : input.channel === 'in_app' ? new Date().toISOString() : null,
      provider_response: webhookUrl ? {} : { reason: input.channel === 'in_app' ? 'stored_in_app' : 'provider_not_configured' },
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Failed to create notification delivery: ${insertError.message}`);
  }

  if (!webhookUrl) {
    return input.channel === 'in_app' ? 'sent' : 'queued';
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.RETENTION_NOTIFICATION_WEBHOOK_SECRET
          ? { authorization: `Bearer ${process.env.RETENTION_NOTIFICATION_WEBHOOK_SECRET}` }
          : {}),
      },
      body: JSON.stringify({
        deliveryId: delivery.id,
        ...input,
      }),
    });

    const providerBody = await response.json().catch(() => ({ status: response.status }));

    const status = response.ok ? 'sent' : 'failed';
    const { error: updateError } = await supabase
      .from('notification_deliveries')
      .update({
        status,
        provider_response: providerBody,
        sent_at: response.ok ? new Date().toISOString() : null,
        failed_at: response.ok ? null : new Date().toISOString(),
        error_message: response.ok ? null : `Webhook returned ${response.status}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', delivery.id);

    if (updateError) {
      throw new Error(`Failed to update notification delivery: ${updateError.message}`);
    }

    return status;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Notification webhook failed';
    await supabase
      .from('notification_deliveries')
      .update({
        status: 'failed',
        failed_at: new Date().toISOString(),
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', delivery.id);

    return 'failed';
  }
}

async function processAutomatedCheckins(limit: number) {
  const supabase = getSupabaseAdmin();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('automated_checkins')
    .select('id,user_id,message_type,scheduled_for,subject,body,status')
    .eq('status', 'pending')
    .lte('scheduled_for', nowIso)
    .order('scheduled_for', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load automated check-ins: ${error.message}`);
  }

  let sent = 0;
  let queued = 0;
  let failed = 0;

  for (const item of data ?? []) {
    const result = await deliverNotification({
      user_id: item.user_id,
      channel: 'in_app',
      source_table: 'automated_checkins',
      source_id: item.id,
      subject: item.subject,
      body: item.body,
      scheduled_for: item.scheduled_for,
    });

    if (result === 'sent') sent += 1;
    if (result === 'queued') queued += 1;
    if (result === 'failed') failed += 1;

    const { error: updateError } = await supabase
      .from('automated_checkins')
      .update({
        status: result === 'failed' ? 'pending' : 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);

    if (updateError) {
      throw new Error(`Failed to update automated check-in: ${updateError.message}`);
    }
  }

  return { scanned: data?.length ?? 0, sent, queued, failed };
}

async function processHabitReminders(limit: number) {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const nowIso = now.toISOString();
  const { data, error } = await supabase
    .from('habit_reminders')
    .select('id,user_id,reminder_type,channel,schedule,message,next_run_at,last_sent_at')
    .eq('enabled', true)
    .or(`next_run_at.is.null,next_run_at.lte.${nowIso}`)
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load habit reminders: ${error.message}`);
  }

  let sent = 0;
  let queued = 0;
  let failed = 0;
  let skipped = 0;

  for (const reminder of data ?? []) {
    const schedule = (reminder.schedule ?? {}) as ReminderSchedule;

    if (reminder.reminder_type === 'reactivation') {
      const { data: streak, error: streakError } = await supabase
        .from('user_streaks')
        .select('last_activity_date')
        .eq('user_id', reminder.user_id)
        .maybeSingle();

      if (streakError) {
        throw new Error(`Failed to load reactivation streak: ${streakError.message}`);
      }

      const inactiveDays = getInactiveDays(streak?.last_activity_date);
      const threshold = Math.max(2, Number(schedule.inactivityDays ?? 3));

      if (inactiveDays !== null && inactiveDays < threshold) {
        skipped += 1;
        await supabase
          .from('habit_reminders')
          .update({
            next_run_at: getNextReminderRun(schedule, now),
            updated_at: nowIso,
          })
          .eq('id', reminder.id);
        continue;
      }
    }

    const result = await deliverNotification({
      user_id: reminder.user_id,
      channel: reminder.channel,
      source_table: 'habit_reminders',
      source_id: reminder.id,
      subject: `Lembrete: ${reminder.reminder_type}`,
      body: reminder.message,
      scheduled_for: reminder.next_run_at ?? nowIso,
    });

    if (result === 'sent') sent += 1;
    if (result === 'queued') queued += 1;
    if (result === 'failed') failed += 1;

    const { error: updateError } = await supabase
      .from('habit_reminders')
      .update({
        last_sent_at: result === 'failed' ? reminder.last_sent_at ?? null : nowIso,
        next_run_at: getNextReminderRun(schedule, now),
        updated_at: nowIso,
      })
      .eq('id', reminder.id);

    if (updateError) {
      throw new Error(`Failed to update habit reminder: ${updateError.message}`);
    }
  }

  return { scanned: data?.length ?? 0, sent, queued, failed, skipped };
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'GET' && request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    verifyWorkerAuth(request);
    const url = new URL(request.url);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') ?? 50)));

    const [checkins, reminders] = await Promise.all([
      processAutomatedCheckins(limit),
      processHabitReminders(limit),
    ]);

    return json({
      ok: true,
      dataMode: 'supabase',
      processedAt: new Date().toISOString(),
      checkins,
      reminders,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
