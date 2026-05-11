create extension if not exists pgcrypto;

create table if not exists public.biometric_wearable_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  avg_hr integer not null check (avg_hr between 30 and 240),
  max_hr integer not null check (max_hr between 30 and 240),
  min_hr integer not null check (min_hr between 30 and 240),
  readings jsonb not null default '[]'::jsonb,
  device_name text not null check (char_length(device_name) between 1 and 120),
  calories integer check (calories is null or calories >= 0),
  hr_zones jsonb not null default '{"zone1":0,"zone2":0,"zone3":0,"zone4":0,"zone5":0}'::jsonb,
  created_at timestamptz not null default now(),
  constraint biometric_wearable_hr_order check (min_hr <= avg_hr and avg_hr <= max_hr),
  constraint biometric_wearable_time_order check (ended_at is null or ended_at >= started_at)
);

create table if not exists public.biometric_hormonal_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  cycle_length_days integer not null check (cycle_length_days between 21 and 45),
  period_length_days integer not null check (period_length_days between 1 and 14),
  created_at timestamptz not null default now(),
  constraint biometric_cycle_period_lt_cycle check (period_length_days < cycle_length_days)
);

create table if not exists public.biometric_pose_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null check (char_length(exercise_name) between 1 and 120),
  analyzed_on date not null,
  rep_count integer not null check (rep_count between 0 and 1000),
  form_score integer not null check (form_score between 0 and 100),
  issues text[] not null default array[]::text[],
  tips text[] not null default array[]::text[],
  key_angles jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists biometric_wearable_sessions_user_started_idx
  on public.biometric_wearable_sessions (user_id, started_at desc);

create index if not exists biometric_hormonal_cycles_user_start_idx
  on public.biometric_hormonal_cycles (user_id, start_date desc);

create index if not exists biometric_pose_analyses_user_created_idx
  on public.biometric_pose_analyses (user_id, created_at desc);

alter table public.biometric_wearable_sessions enable row level security;
alter table public.biometric_hormonal_cycles enable row level security;
alter table public.biometric_pose_analyses enable row level security;

drop policy if exists biometric_wearable_sessions_own_select on public.biometric_wearable_sessions;
create policy biometric_wearable_sessions_own_select
  on public.biometric_wearable_sessions for select
  using (auth.uid() = user_id);

drop policy if exists biometric_wearable_sessions_own_insert on public.biometric_wearable_sessions;
create policy biometric_wearable_sessions_own_insert
  on public.biometric_wearable_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists biometric_hormonal_cycles_own_select on public.biometric_hormonal_cycles;
create policy biometric_hormonal_cycles_own_select
  on public.biometric_hormonal_cycles for select
  using (auth.uid() = user_id);

drop policy if exists biometric_hormonal_cycles_own_insert on public.biometric_hormonal_cycles;
create policy biometric_hormonal_cycles_own_insert
  on public.biometric_hormonal_cycles for insert
  with check (auth.uid() = user_id);

drop policy if exists biometric_pose_analyses_own_select on public.biometric_pose_analyses;
create policy biometric_pose_analyses_own_select
  on public.biometric_pose_analyses for select
  using (auth.uid() = user_id);

drop policy if exists biometric_pose_analyses_own_insert on public.biometric_pose_analyses;
create policy biometric_pose_analyses_own_insert
  on public.biometric_pose_analyses for insert
  with check (auth.uid() = user_id);
