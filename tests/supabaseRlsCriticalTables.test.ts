import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const baseMigration = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260511013442_user_periodization_plans.sql'), 'utf-8');
const hardeningMigration = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260513044000_harden_periodization_rls_user_id.sql'), 'utf-8');

describe('supabase critical rls tables', () => {
  it('does not require public.profiles FK for user_periodization_plans creation', () => {
    expect(baseMigration).not.toContain('references public.profiles(id)');
    expect(baseMigration).toContain('user_id uuid not null references auth.users(id) on delete cascade');
  });

  it('enables rls and locks policy to auth.uid() = user_id', () => {
    expect(baseMigration).toContain('alter table public.user_periodization_plans enable row level security;');
    expect(baseMigration).toContain('using (auth.uid() = user_id);');
    expect(baseMigration).toContain('with check (auth.uid() = user_id);');
  });

  it('keeps hardening migration idempotent for user_id and policies', () => {
    expect(hardeningMigration).toContain('add column if not exists user_id uuid;');
    expect(hardeningMigration).toContain('drop policy if exists user_periodization_plans_select_own');
    expect(hardeningMigration).toContain('create unique index if not exists user_periodization_plans_user_week_key');
  });
});
