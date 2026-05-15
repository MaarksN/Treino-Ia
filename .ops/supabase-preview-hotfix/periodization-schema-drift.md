# Supabase Preview Hotfix: Periodization Schema Drift

## Original error

```txt
ERROR: column "week_start" does not exist (SQLSTATE 42703)

create unique index if not exists user_periodization_plans_user_week_key
  on public.user_periodization_plans(user_id, week_start, week_end)
```

## Root cause

The Supabase GitHub App ran migrations against the connected main/preview database and found an existing `public.user_periodization_plans` table without the `week_start` and `week_end` columns. The hardening migration `20260513044000_harden_periodization_rls_user_id.sql` tried to create a unique index on those columns before ensuring they existed.

This is schema drift in Supabase, not an application, App.tsx, CI, Lighthouse, secret, or token issue.

## Pre-change checks

- The failing check was created by the Supabase GitHub App for commit `56b4c08` on `main`.
- The check output shows `20260513044000_harden_periodization_rls_user_id.sql` reached the index statement and failed there, so that migration was not successfully completed in the connected main/preview database.
- No authenticated Supabase CLI or MCP access is available in this environment, so direct inspection of the remote `supabase_migrations` table was not possible.
- The observed GitHub App behavior on `main` applies repository migrations over the connected database state; it is not a clean-from-zero reset in this failing path.
- The expected column types were confirmed from `supabase/migrations/20260511013442_user_periodization_plans.sql`: `week_start date` and `week_end date`.

## File changed

- `supabase/migrations/20260513044000_harden_periodization_rls_user_id.sql`

## Migration decision

Edited the existing hardening migration instead of creating a new migration. The failing statement is inside `20260513044000_harden_periodization_rls_user_id.sql`; a later migration would not be reached while this migration fails.

The earlier table-creation migration defines:

```sql
week_start date not null,
week_end date not null
```

For existing drifted tables, this hotfix adds the missing columns as nullable `date` columns before creating the index. It does not apply `not null` because existing rows may require a safe backfill first.

## SQL applied

```sql
alter table if exists public.user_periodization_plans
  add column if not exists week_start date;

alter table if exists public.user_periodization_plans
  add column if not exists week_end date;
```

The existing index remains:

```sql
create unique index if not exists user_periodization_plans_user_week_key
  on public.user_periodization_plans(user_id, week_start, week_end);
```

## Validation

- `git status --short`: executed.
- `git diff --check`: executed.
- `supabase db lint`: skipped; Supabase CLI is not installed in this environment.
- `supabase db reset`: skipped; Supabase CLI is not installed in this environment.

## Remaining risk

Rows that existed before this hotfix may have `week_start` and `week_end` as null. The unique index permits multiple null values in Postgres, so this is safe for migration completion but may not enforce weekly uniqueness for legacy rows until a future backfill.

## Final status

Hotfix branch: `fix/supabase-periodization-schema-drift`

Expected verification source: Supabase Preview on the hotfix PR.
