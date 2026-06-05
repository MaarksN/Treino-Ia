import { handleApiError, json, getBearerToken } from '../_lib/http';
import { getSupabaseAdmin } from '../_lib/server-supabase';
import { getServerEntitlement } from '../_lib/billing-entitlements';
import { checkRateLimit } from '../_lib/distributedRateLimit';

export const config = {
  runtime: 'nodejs',
};

const EXPORT_COLLECTIONS = [
  ['workout_history', 'training_workout_history_records', 'user_id'],
  ['workout_plans', 'training_workout_plans', 'user_id'],
  ['workout_sessions', 'workout_sessions', 'user_id'],
  ['exercise_logs', 'exercise_logs', 'user_id'],
  ['set_logs', 'set_logs', 'user_id'],
  ['personal_records', 'personal_records', 'user_id'],
  ['ai_audits', 'ai_decision_audits', 'user_id'],
  ['ai_recommendations', 'ai_recommendations', 'user_id'],
  ['ai_memory', 'ai_long_term_memory', 'user_id'],
  ['daily_checkins', 'recovery_daily_checkins', 'user_id'],
  ['injuries', 'health_injury_records', 'user_id'],
  ['symptoms', 'health_symptom_records', 'user_id'],
  ['meals', 'nutrition_meal_entries', 'user_id'],
  ['macro_targets', 'nutrition_macro_targets', 'user_id'],
  ['favorite_foods', 'nutrition_favorite_foods', 'user_id'],
  ['hydration_entries', 'hydration_entries', 'user_id'],
  ['hydration_goals', 'hydration_goals', 'user_id'],
  ['sleep_entries', 'sleep_entries', 'user_id'],
  ['periodization_plans', 'user_periodization_plans', 'user_id'],
  ['retention_profiles', 'retention_profiles', 'user_id'],
  ['user_streaks', 'user_streaks', 'user_id'],
  ['habit_events', 'habit_events', 'user_id'],
  ['habit_reminders', 'habit_reminders', 'user_id'],
  ['retention_badges', 'retention_badges', 'user_id'],
  ['automated_checkins', 'automated_checkins', 'user_id'],
  ['alternative_workouts', 'alternative_workouts', 'user_id'],
  ['workout_calendar_items', 'workout_calendar_items', 'user_id'],
  ['health_integrations', 'health_integrations', 'user_id'],
  ['billing_invoices', 'billing_invoice_receipts', 'user_id'],
  ['billing_referrals_sent', 'billing_referrals', 'referrer_user_id'],
  ['billing_referrals_received', 'billing_referrals', 'referred_user_id'],
  ['platform_preferences', 'platform_user_preferences', 'user_id'],
  ['user_audit_logs', 'user_audit_logs', 'user_id'],
  ['privacy_exports', 'privacy_export_requests', 'user_id'],
  ['account_deletion_requests', 'account_deletion_requests', 'user_id'],
  ['social_profile', 'social_profiles', 'id'],
  ['social_posts', 'social_posts', 'author_id'],
  ['social_comments', 'social_post_comments', 'author_id'],
] as const;

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
    const rateLimit = await checkRateLimit(userId, 5, 60 * 60 * 1000, 'compliance_export');

    if (!rateLimit.allowed) {
      return json(
        { error: 'Too many compliance export requests.', resetAt: rateLimit.resetAt },
        429,
        request,
      );
    }

    const [{ data: profile }, collectionResults, entitlement] = await Promise.all([
      supabase.from('training_user_profiles').select('*').eq('user_id', userId).maybeSingle(),
      Promise.all(
        EXPORT_COLLECTIONS.map(async ([key, table, column]) => {
          const { data } = await supabase.from(table).select('*').eq(column, userId);
          return [key, data ?? []] as const;
        }),
      ),
      getServerEntitlement(userId).catch(() => null),
    ]);
    const collections = Object.fromEntries(collectionResults);

    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: userId,
        email: authData.user.email,
        phone: authData.user.phone,
        created_at: authData.user.created_at,
      },
      profile: profile ?? null,
      ...collections,
      billing_entitlement: entitlement,
    };

    return json(exportData, 200, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
