create extension if not exists pgcrypto;

create table if not exists public.training_user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_json jsonb not null check (jsonb_typeof(profile_json) = 'object'),
  profile_goal text check (profile_goal is null or char_length(profile_goal) <= 160),
  profile_name text check (profile_name is null or char_length(profile_name) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_workout_plans (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (char_length(id) between 1 and 120),
  plan_name text not null check (char_length(plan_name) between 1 and 200),
  goal_description text not null default '' check (char_length(goal_description) <= 1000),
  created_at_ms bigint not null default 0 check (created_at_ms >= 0),
  is_current boolean not null default false,
  plan_json jsonb not null check (jsonb_typeof(plan_json) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.training_workout_history_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (char_length(id) between 1 and 120),
  workout_date timestamptz not null,
  plan_id text not null check (char_length(plan_id) between 1 and 120),
  day_id text not null check (char_length(day_id) between 1 and 120),
  day_name text not null check (char_length(day_name) between 1 and 200),
  focus text not null default '' check (char_length(focus) <= 200),
  volume_load numeric not null default 0 check (volume_load >= 0),
  duration_minutes integer not null default 0 check (duration_minutes >= 0 and duration_minutes <= 1440),
  record_json jsonb not null check (jsonb_typeof(record_json) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.legacy_training_migration_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'local_storage' check (source in ('local_storage', 'manual_sync')),
  profile_migrated boolean not null default false,
  plans_migrated integer not null default 0 check (plans_migrated >= 0),
  history_migrated integer not null default 0 check (history_migrated >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  data_mode text not null default 'supabase' check (data_mode = 'supabase'),
  warning text check (warning is null or char_length(warning) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists training_workout_plans_user_current_idx
  on public.training_workout_plans (user_id, is_current desc, created_at_ms desc);

create index if not exists training_workout_history_user_date_idx
  on public.training_workout_history_records (user_id, workout_date desc);

create index if not exists legacy_training_migration_user_date_idx
  on public.legacy_training_migration_audits (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists training_user_profiles_updated_at on public.training_user_profiles;
create trigger training_user_profiles_updated_at
  before update on public.training_user_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists training_workout_plans_updated_at on public.training_workout_plans;
create trigger training_workout_plans_updated_at
  before update on public.training_workout_plans
  for each row execute function public.set_updated_at();

drop trigger if exists training_workout_history_records_updated_at on public.training_workout_history_records;
create trigger training_workout_history_records_updated_at
  before update on public.training_workout_history_records
  for each row execute function public.set_updated_at();

alter table public.training_user_profiles enable row level security;
alter table public.training_workout_plans enable row level security;
alter table public.training_workout_history_records enable row level security;
alter table public.legacy_training_migration_audits enable row level security;

drop policy if exists training_user_profiles_own_select on public.training_user_profiles;
create policy training_user_profiles_own_select
  on public.training_user_profiles for select
  using (auth.uid() = user_id);

drop policy if exists training_user_profiles_own_insert on public.training_user_profiles;
create policy training_user_profiles_own_insert
  on public.training_user_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists training_user_profiles_own_update on public.training_user_profiles;
create policy training_user_profiles_own_update
  on public.training_user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists training_workout_plans_own_select on public.training_workout_plans;
create policy training_workout_plans_own_select
  on public.training_workout_plans for select
  using (auth.uid() = user_id);

drop policy if exists training_workout_plans_own_insert on public.training_workout_plans;
create policy training_workout_plans_own_insert
  on public.training_workout_plans for insert
  with check (auth.uid() = user_id);

drop policy if exists training_workout_plans_own_update on public.training_workout_plans;
create policy training_workout_plans_own_update
  on public.training_workout_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists training_workout_plans_own_delete on public.training_workout_plans;
create policy training_workout_plans_own_delete
  on public.training_workout_plans for delete
  using (auth.uid() = user_id);

drop policy if exists training_workout_history_own_select on public.training_workout_history_records;
create policy training_workout_history_own_select
  on public.training_workout_history_records for select
  using (auth.uid() = user_id);

drop policy if exists training_workout_history_own_insert on public.training_workout_history_records;
create policy training_workout_history_own_insert
  on public.training_workout_history_records for insert
  with check (auth.uid() = user_id);

drop policy if exists training_workout_history_own_update on public.training_workout_history_records;
create policy training_workout_history_own_update
  on public.training_workout_history_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists legacy_training_migration_audits_own_select on public.legacy_training_migration_audits;
create policy legacy_training_migration_audits_own_select
  on public.legacy_training_migration_audits for select
  using (auth.uid() = user_id);

drop policy if exists legacy_training_migration_audits_own_insert on public.legacy_training_migration_audits;
create policy legacy_training_migration_audits_own_insert
  on public.legacy_training_migration_audits for insert
  with check (auth.uid() = user_id);
