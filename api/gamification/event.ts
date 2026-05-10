import { handleApiError, HttpError, json, readJsonObject } from '../_lib/http';
import { getSupabaseAdmin, requireSupabaseUser } from '../_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

const EVENT_REWARDS: Record<string, { xp: number; coins: number }> = {
  login: { xp: 25, coins: 5 },
  checkin: { xp: 80, coins: 20 },
  workout_completed: { xp: 250, coins: 50 },
};

function isSameUtcDay(value?: string | null) {
  if (!value) return false;

  const then = new Date(value);
  const now = new Date();

  return (
    then.getUTCFullYear() === now.getUTCFullYear() &&
    then.getUTCMonth() === now.getUTCMonth() &&
    then.getUTCDate() === now.getUTCDate()
  );
}

function isYesterdayUtc(value?: string | null) {
  if (!value) return false;

  const then = new Date(value);
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  return (
    then.getUTCFullYear() === yesterday.getUTCFullYear() &&
    then.getUTCMonth() === yesterday.getUTCMonth() &&
    then.getUTCDate() === yesterday.getUTCDate()
  );
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireSupabaseUser(request);
    const body = await readJsonObject(request);
    const eventType = typeof body.eventType === 'string' ? body.eventType : '';
    const reward = EVENT_REWARDS[eventType];

    if (!reward) {
      throw new HttpError(400, 'Unsupported gamification event');
    }

    const supabase = getSupabaseAdmin();
    const { data: current, error: currentError } = await supabase
      .from('gamification_profiles')
      .upsert({ user_id: user.id }, { onConflict: 'user_id' })
      .select('last_login_at,last_checkin_at,login_streak')
      .single();

    if (currentError) {
      throw new Error(`Failed to load gamification profile: ${currentError.message}`);
    }

    if (eventType === 'login' && isSameUtcDay(current.last_login_at)) {
      return json({ skipped: true, reason: 'Login already recorded today' });
    }

    if (eventType === 'checkin' && isSameUtcDay(current.last_checkin_at)) {
      return json({ skipped: true, reason: 'Check-in already recorded today' });
    }

    const { data: profile, error: eventError } = await supabase.rpc('apply_gamification_event', {
      p_user_id: user.id,
      p_event_type: eventType,
      p_source_id: typeof body.sourceId === 'string' ? body.sourceId : null,
      p_xp_delta: reward.xp,
      p_coin_delta: reward.coins,
      p_metadata: {
        origin: 'api',
        eventType,
      },
    });

    if (eventError) {
      throw new Error(`Failed to apply gamification event: ${eventError.message}`);
    }

    const patch =
      eventType === 'login'
        ? {
            last_login_at: new Date().toISOString(),
            login_streak: isYesterdayUtc(current.last_login_at)
              ? Number(current.login_streak ?? 0) + 1
              : 1,
          }
        : eventType === 'checkin'
          ? {
            last_checkin_at: new Date().toISOString(),
          }
          : null;

    if (!patch) {
      return json({ profile });
    }

    const { data: updated, error: updateError } = await supabase
      .from('gamification_profiles')
      .update(patch)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (updateError) {
      throw new Error(`Failed to update gamification profile: ${updateError.message}`);
    }

    return json({ profile: updated ?? profile });
  } catch (error) {
    return handleApiError(error);
  }
}
