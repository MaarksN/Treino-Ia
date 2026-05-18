import { handleApiError, HttpError, json, readJsonObject } from '../_lib/http';
import { getSupabaseAdmin, requireSupabaseUser } from '../_lib/server-supabase';
import { buildIdempotencyKey, getDailyPeriod, normalizeEventKey } from '../_lib/idempotency';

export const config = {
  runtime: 'nodejs',
};

const EVENT_REWARDS: Record<string, { xp: number; coins: number }> = {
  login: { xp: 25, coins: 5 },
  checkin: { xp: 80, coins: 20 },
  daily_checkin: { xp: 80, coins: 20 },
  workout_completed: { xp: 250, coins: 50 },
  loot_box_opened: { xp: 40, coins: 0 },
  season_reward_claimed: { xp: 120, coins: 35 },
  clan_joined: { xp: 30, coins: 0 },
  clan_contribution: { xp: 50, coins: 10 },
};

function isSameUtcDay(value?: string | null) {
  if (!value) return false;
  const then = new Date(value);
  const now = new Date();
  return then.getUTCFullYear() === now.getUTCFullYear() && then.getUTCMonth() === now.getUTCMonth() && then.getUTCDate() === now.getUTCDate();
}
function isYesterdayUtc(value?: string | null) {
  if (!value) return false;
  const then = new Date(value);
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return then.getUTCFullYear() === yesterday.getUTCFullYear() && then.getUTCMonth() === yesterday.getUTCMonth() && then.getUTCDate() === yesterday.getUTCDate();
}

async function ensureUniqueSourceEvent(supabase: ReturnType<typeof getSupabaseAdmin>, userId: string, eventType: string, sourceId?: string | null, period: string = '') {
  const normalizedKey = normalizeEventKey(eventType, sourceId);
  const idempotencyKey = buildIdempotencyKey(userId, eventType, sourceId, period);

  // Future: Requires transactional RPC for strong multi-instance guarantees.
  const finalSourceId = sourceId || idempotencyKey;
  const { data, error } = await supabase
    .from('gamification_ledger')
    .select('id')
    .eq('user_id', userId)
    .eq('event_type', eventType)
    .eq('source_id', finalSourceId) // Fallback to idempotencyKey as a source_id for uniqueness if sourceId is null
    .maybeSingle();
  if (error) throw new Error(`Failed to validate idempotency: ${error.message}`);
  if (data) throw new HttpError(409, `Evento já processado para esta chave: ${idempotencyKey}`);

  return idempotencyKey;
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireSupabaseUser(request);
    const body = await readJsonObject(request);
    const eventType = typeof body.eventType === 'string' ? body.eventType : '';
    const sourceId = typeof body.sourceId === 'string' ? body.sourceId.trim() : null;
    const reward = EVENT_REWARDS[eventType];

    if (!reward && eventType !== 'mission_claimed' && eventType !== 'cosmetic_purchased') {
      throw new HttpError(400, 'Unsupported gamification event');
    }

    const supabase = getSupabaseAdmin();
    const { data: current, error: currentError } = await supabase
      .from('gamification_profiles')
      .upsert({ user_id: user.id }, { onConflict: 'user_id' })
      .select('last_login_at,last_checkin_at,login_streak,coins')
      .single();

    if (currentError) throw new Error(`Failed to load gamification profile: ${currentError.message}`);

    if ((eventType === 'checkin' || eventType === 'daily_checkin') && isSameUtcDay(current.last_checkin_at)) {
      return json({ skipped: true, reason: 'Check-in already recorded today' });
    }
    if (eventType === 'login' && isSameUtcDay(current.last_login_at)) {
      return json({ skipped: true, reason: 'Login already recorded today' });
    }

    if (eventType === 'checkin' || eventType === 'daily_checkin' || eventType === 'login') {
       await ensureUniqueSourceEvent(supabase, user.id, eventType, null, getDailyPeriod());
    }

    if (eventType === 'mission_claimed') {
      const missionId = sourceId;
      if (!missionId) throw new HttpError(400, 'mission_claimed exige sourceId (mission id).');

      const idempotencyKey = await ensureUniqueSourceEvent(supabase, user.id, eventType, missionId);

      const { data: mission, error: missionError } = await supabase
        .from('gamification_missions')
        .select('id,status,xp_reward,coin_reward')
        .eq('id', missionId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (missionError) throw new Error(`Failed to load mission: ${missionError.message}`);
      if (!mission) throw new HttpError(404, 'Mission not found.');
      if (mission.status === 'claimed') return json({ skipped: true, reason: 'Mission already claimed' });
      if (mission.status !== 'completed') throw new HttpError(400, 'Mission is not completed yet');

      const { error: updateMissionError } = await supabase
        .from('gamification_missions')
        .update({ status: 'claimed' })
        .eq('id', missionId)
        .eq('user_id', user.id)
        .neq('status', 'claimed');
      if (updateMissionError) throw new Error(`Failed to claim mission: ${updateMissionError.message}`);

      const { data: profile, error: eventError } = await supabase.rpc('apply_gamification_event', {
        p_user_id: user.id, p_event_type: eventType, p_source_id: missionId, p_xp_delta: mission.xp_reward, p_coin_delta: mission.coin_reward,
        p_metadata: { origin: 'api', eventType, missionId, idempotencyKey },
      });
      if (eventError) throw new Error(`Failed to apply gamification event: ${eventError.message}`);
      return json({ profile });
    }

    if (eventType === 'cosmetic_purchased') {
      const cosmeticId = sourceId;
      if (!cosmeticId) throw new HttpError(400, 'cosmetic_purchased exige sourceId (cosmetic id).');
      const cost = typeof body.cost === 'number' && Number.isFinite(body.cost) ? Math.max(0, Math.floor(body.cost)) : 0;
      if (cost <= 0) throw new HttpError(400, 'Cosmetic cost must be a positive integer.');
      if ((current.coins ?? 0) < cost) throw new HttpError(409, 'Saldo insuficiente para comprar cosmético.');

      const { data: existingCosmetic, error: existingError } = await supabase
        .from('gamification_cosmetics').select('cosmetic_id').eq('user_id', user.id).eq('cosmetic_id', cosmeticId).maybeSingle();
      if (existingError) throw new Error(`Failed to verify cosmetic ownership: ${existingError.message}`);
      if (existingCosmetic) return json({ skipped: true, reason: 'Cosmetic already unlocked' });

      const idempotencyKey = await ensureUniqueSourceEvent(supabase, user.id, eventType, cosmeticId);

      const { error: insertError } = await supabase
        .from('gamification_cosmetics')
        .insert({ user_id: user.id, cosmetic_id: cosmeticId, equipped: false });
      if (insertError) throw new Error(`Failed to unlock cosmetic: ${insertError.message}`);

      const { data: profile, error: eventError } = await supabase.rpc('apply_gamification_event', {
        p_user_id: user.id, p_event_type: eventType, p_source_id: cosmeticId, p_xp_delta: 0, p_coin_delta: -cost,
        p_metadata: { origin: 'api', eventType, cosmeticId, cost, idempotencyKey },
      });
      if (eventError) throw new Error(`Failed to apply gamification event: ${eventError.message}`);
      return json({ profile });
    }

    let resolvedSourceId = sourceId;
    let idempotencyKey;
    if (eventType !== 'checkin' && eventType !== 'daily_checkin' && eventType !== 'login') {
        idempotencyKey = await ensureUniqueSourceEvent(supabase, user.id, eventType, sourceId);
    } else {
        idempotencyKey = buildIdempotencyKey(user.id, eventType, null, getDailyPeriod());
        resolvedSourceId = idempotencyKey;
    }

    const { data: profile, error: eventError } = await supabase.rpc('apply_gamification_event', {
      p_user_id: user.id,
      p_event_type: eventType,
      p_source_id: resolvedSourceId,
      p_xp_delta: reward.xp,
      p_coin_delta: reward.coins,
      p_metadata: { origin: 'api', eventType, idempotencyKey },
    });
    if (eventError) throw new Error(`Failed to apply gamification event: ${eventError.message}`);

    const patch = eventType === 'login' ? { last_login_at: new Date().toISOString(), login_streak: isYesterdayUtc(current.last_login_at) ? Number(current.login_streak ?? 0) + 1 : 1 } : (eventType === 'checkin' || eventType === 'daily_checkin') ? { last_checkin_at: new Date().toISOString() } : null;
    if (!patch) return json({ profile });

    const { data: updated, error: updateError } = await supabase
      .from('gamification_profiles')
      .update(patch)
      .eq('user_id', user.id)
      .select('*')
      .single();
    if (updateError) throw new Error(`Failed to update gamification profile: ${updateError.message}`);
    return json({ profile: updated ?? profile });
  } catch (error) {
    return handleApiError(error);
  }
}
