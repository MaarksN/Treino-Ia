create extension if not exists pgcrypto;

create table if not exists public.workout_execution_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  day_id text not null,
  day_name text not null,
  focus text not null,
  volume_load numeric not null default 0 check (volume_load >= 0),
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  completed_at timestamptz not null default now(),
  workout_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_execution_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.workout_execution_sessions(id) on delete cascade,
  exercise_id text,
  exercise_name text not null,
  set_number integer not null check (set_number > 0),
  weight numeric check (weight >= 0),
  reps integer check (reps >= 0),
  rpe numeric check (rpe >= 1 and rpe <= 10),
  failed_concentric boolean not null default false,
  failed_technical boolean not null default false,
  note text,
  completed_at timestamptz not null default now()
);

create table if not exists public.personal_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null,
  weight numeric not null check (weight > 0),
  reps integer not null check (reps > 0),
  plan_id text not null,
  achieved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_name)
);

create table if not exists public.exercise_library_custom (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 80),
  muscle_group text not null,
  movement_pattern text not null,
  tags text[] not null default array[]::text[],
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercise_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create index if not exists workout_execution_sessions_user_completed_idx
  on public.workout_execution_sessions (user_id, completed_at desc);

create index if not exists workout_execution_sets_user_exercise_idx
  on public.workout_execution_sets (user_id, exercise_name, completed_at desc);

create index if not exists workout_execution_sets_session_idx
  on public.workout_execution_sets (session_id);

create index if not exists exercise_library_custom_user_name_idx
  on public.exercise_library_custom (user_id, lower(name));

alter table public.workout_execution_sessions enable row level security;
alter table public.workout_execution_sets enable row level security;
alter table public.personal_records enable row level security;
alter table public.exercise_library_custom enable row level security;
alter table public.exercise_favorites enable row level security;

drop policy if exists workout_execution_sessions_own_select on public.workout_execution_sessions;
create policy workout_execution_sessions_own_select
  on public.workout_execution_sessions for select
  using (auth.uid() = user_id);

drop policy if exists workout_execution_sessions_own_insert on public.workout_execution_sessions;
create policy workout_execution_sessions_own_insert
  on public.workout_execution_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists workout_execution_sessions_own_update on public.workout_execution_sessions;
create policy workout_execution_sessions_own_update
  on public.workout_execution_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists workout_execution_sets_own_select on public.workout_execution_sets;
create policy workout_execution_sets_own_select
  on public.workout_execution_sets for select
  using (auth.uid() = user_id);

drop policy if exists workout_execution_sets_own_insert on public.workout_execution_sets;
create policy workout_execution_sets_own_insert
  on public.workout_execution_sets for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.workout_execution_sessions sessions
      where sessions.id = session_id
        and sessions.user_id = auth.uid()
    )
  );

drop policy if exists personal_records_own_select on public.personal_records;
create policy personal_records_own_select
  on public.personal_records for select
  using (auth.uid() = user_id);

drop policy if exists personal_records_own_upsert on public.personal_records;
create policy personal_records_own_upsert
  on public.personal_records for insert
  with check (auth.uid() = user_id);

drop policy if exists personal_records_own_update on public.personal_records;
create policy personal_records_own_update
  on public.personal_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists exercise_library_custom_own_select on public.exercise_library_custom;
create policy exercise_library_custom_own_select
  on public.exercise_library_custom for select
  using (auth.uid() = user_id);

drop policy if exists exercise_library_custom_own_insert on public.exercise_library_custom;
create policy exercise_library_custom_own_insert
  on public.exercise_library_custom for insert
  with check (auth.uid() = user_id);

drop policy if exists exercise_library_custom_own_update on public.exercise_library_custom;
create policy exercise_library_custom_own_update
  on public.exercise_library_custom for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists exercise_favorites_own_select on public.exercise_favorites;
create policy exercise_favorites_own_select
  on public.exercise_favorites for select
  using (auth.uid() = user_id);

drop policy if exists exercise_favorites_own_insert on public.exercise_favorites;
create policy exercise_favorites_own_insert
  on public.exercise_favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists exercise_favorites_own_delete on public.exercise_favorites;
create policy exercise_favorites_own_delete
  on public.exercise_favorites for delete
  using (auth.uid() = user_id);
