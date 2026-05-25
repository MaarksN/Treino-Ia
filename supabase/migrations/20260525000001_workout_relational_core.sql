-- Release stabilization: relational workout core with legacy JSON compatibility.

create extension if not exists pgcrypto;

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legacy_session_id text,
  plan_id text,
  day_id text,
  day_name text,
  focus text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'in_progress',
  total_volume numeric not null default 0,
  duration_seconds integer,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, legacy_session_id)
);

create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  exercise_name text not null,
  order_index integer not null default 0,
  target_sets integer,
  target_reps text,
  target_rest text,
  completed boolean not null default false,
  exercise_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.set_logs (
  id uuid primary key default gen_random_uuid(),
  exercise_log_id uuid not null references public.exercise_logs(id) on delete cascade,
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  set_index integer not null default 0,
  weight numeric not null default 0,
  reps integer not null default 0,
  rpe numeric,
  completed boolean not null default false,
  volume numeric generated always as (coalesce(weight, 0) * coalesce(reps, 0)) stored,
  is_personal_record boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exercise_log_id, set_index)
);

create table if not exists public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  exercise_name text not null,
  record_type text not null,
  value numeric not null,
  unit text not null,
  source_session_id uuid references public.workout_sessions(id) on delete set null,
  source_set_log_id uuid references public.set_logs(id) on delete set null,
  achieved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_type text not null,
  status text not null default 'pending',
  payload_json jsonb not null,
  reason text,
  source_session_id uuid references public.workout_sessions(id) on delete set null,
  legacy_source_session_id text,
  decided_by uuid references auth.users(id) on delete set null,
  decision_reason text,
  plan_before_json jsonb,
  plan_after_json jsonb,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  dismissed_at timestamptz,
  applied_at timestamptz
);

create table if not exists public.plan_revisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  source_recommendation_id uuid references public.ai_recommendations(id) on delete set null,
  status text not null default 'draft',
  revision_json jsonb not null,
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  rejected_at timestamptz
);

create index if not exists workout_sessions_user_created_idx on public.workout_sessions (user_id, created_at desc);
create index if not exists workout_sessions_user_status_idx on public.workout_sessions (user_id, status, created_at desc);
create index if not exists workout_sessions_plan_idx on public.workout_sessions (plan_id);
create index if not exists exercise_logs_session_order_idx on public.exercise_logs (session_id, order_index);
create index if not exists exercise_logs_user_exercise_idx on public.exercise_logs (user_id, exercise_id);
create index if not exists set_logs_session_idx on public.set_logs (session_id, set_index);
create index if not exists set_logs_exercise_log_idx on public.set_logs (exercise_log_id, set_index);
create index if not exists personal_records_user_exercise_idx on public.personal_records (user_id, exercise_id, record_type, value desc);
create index if not exists ai_recommendations_user_status_idx on public.ai_recommendations (user_id, status, created_at desc);
create index if not exists ai_recommendations_legacy_session_idx on public.ai_recommendations (legacy_source_session_id);
create index if not exists plan_revisions_user_plan_idx on public.plan_revisions (user_id, plan_id, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'workout_sessions',
    'exercise_logs',
    'set_logs',
    'personal_records',
    'ai_recommendations',
    'plan_revisions'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_own_select', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_own_insert', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_own_update', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_own_delete', table_name);
    execute format('create policy %I on public.%I for select using (auth.uid() = user_id)', table_name || '_own_select', table_name);
    execute format('create policy %I on public.%I for insert with check (auth.uid() = user_id)', table_name || '_own_insert', table_name);
    execute format('create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', table_name || '_own_update', table_name);
    execute format('create policy %I on public.%I for delete using (auth.uid() = user_id)', table_name || '_own_delete', table_name);
  end loop;
end;
$$;

notify pgrst, 'reload schema';
