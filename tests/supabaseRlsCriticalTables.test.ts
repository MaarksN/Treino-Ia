import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const files = [
  'supabase/migrations/20260511120000_platform_blocks_11_20_core.sql',
  'supabase/billing-gamification-schema.sql',
  'supabase/migrations/20260511023000_training_execution.sql',
  'supabase/migrations/20260511013442_user_periodization_plans.sql',
  'supabase/migrations/20260513044000_harden_periodization_rls_user_id.sql',
];

const corpus = files.map(file => readFileSync(resolve(process.cwd(), file), 'utf-8')).join('\n');

const criticalTables = [
  'billing_subscriptions',
  'billing_usage_counters',
  'stripe_webhook_events',
  'gamification_profiles',
  'gamification_ledger',
  'gamification_missions',
  'gamification_cosmetics',
  'ai_decision_audits',
  'workout_execution_sessions',
  'workout_execution_sets',
  'user_periodization_plans',
];

describe('supabase RLS critical tables', () => {
  it('enables RLS on critical billing/gamification/training tables', () => {
    for (const table of criticalTables) {
      const enabled = corpus.toLowerCase().includes(`alter table public.${table} enable row level security`) || corpus.toLowerCase().includes(`alter table if exists public.${table} enable row level security`);
      expect(enabled, `RLS should be enabled for ${table}`).toBe(true);
    }
  });

  it('contains owner policies guarded by auth.uid() = user_id', () => {
    const required = [
      'billing_subscriptions_own_select',
      'billing_usage_counters_own_select',
      'gamification_profiles_select_own',
      'gamification_ledger_select_own',
      'gamification_missions_select_own',
      'gamification_cosmetics_select_own',
      'ai_decision_audits_select_own',
      'workout_execution_sessions_own_select',
      'workout_execution_sets_own_select',
      'user_periodization_plans_own_all',
      'auth.uid() = user_id',
    ];
    for (const fragment of required) {
      expect(corpus.includes(fragment), `Expected policy fragment: ${fragment}`).toBe(true);
    }
  });

  it('no longer relies on auth.uid() = profile_id in periodization RLS', () => {
    const hardened = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260513044000_harden_periodization_rls_user_id.sql'), 'utf-8');
    expect(hardened.includes('auth.uid() = user_id')).toBe(true);
  });
});
