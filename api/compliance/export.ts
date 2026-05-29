import { handleApiError, json, getBearerToken } from '../_lib/http';
import { getSupabaseAdmin } from '../_lib/server-supabase';
import { getServerEntitlement } from '../_lib/billing-entitlements';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true }, 200, request);
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, request);

  try {
    const token = getBearerToken(request);
    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return json({ error: 'Unauthorized' }, 401, request);
    }
    const userId = authData.user.id;

    // Fetch data for portability
    const [
      { data: profile },
      { data: history },
      { data: audits },
      { data: checkins },
      { data: periodization },
      entitlement
    ] = await Promise.all([
      supabase.from('training_user_profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('training_workout_history_records').select('*').eq('user_id', userId),
      supabase.from('ai_decision_audits').select('*').eq('user_id', userId),
      supabase.from('recovery_daily_checkins').select('*').eq('user_id', userId),
      supabase.from('user_periodization_plans').select('*').eq('user_id', userId),
      getServerEntitlement(userId).catch(() => null)
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: userId,
        email: authData.user.email,
        phone: authData.user.phone,
        created_at: authData.user.created_at
      },
      profile: profile ?? null,
      workout_history: history ?? [],
      ai_audits: audits ?? [],
      daily_checkins: checkins ?? [],
      periodization_plans: periodization ?? [],
      billing_entitlement: entitlement
    };

    return json(exportData, 200, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
