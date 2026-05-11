create extension if not exists pgcrypto;

create table if not exists public.retention_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  consistency_workouts_per_week integer not null default 4 check (consistency_workouts_per_week between 1 and 7),
  consistency_checkins_per_week integer not null default 5 check (consistency_checkins_per_week between 1 and 7),
  hydration_goal_ml integer not null default 2500 check (hydration_goal_ml between 500 and 8000),
  sleep_goal_minutes integer not null default 480 check (sleep_goal_minutes between 240 and 720),
  preferred_workout_time text not null default '07:00',
  quiet_hours_start text not null default '22:30',
  quiet_hours_end text not null default '07:00',
  last_activity_at timestamptz,
  white_label_tenant_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_streak integer not null default 0 check (daily_streak >= 0),
  weekly_streak integer not null default 0 check (weekly_streak >= 0),
  best_daily_streak integer not null default 0 check (best_daily_streak >= 0),
  best_weekly_streak integer not null default 0 check (best_weekly_streak >= 0),
  last_activity_date date,
  active_week_start date,
  weekly_workouts integer not null default 0 check (weekly_workouts >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.habit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'workout_completed',
      'checkin_completed',
      'hydration_logged',
      'sleep_logged',
      'pr_shared',
      'badge_unlocked',
      'alternative_workout_completed',
      'coach_message_sent'
    )
  ),
  event_date date not null default current_date,
  amount numeric check (amount is null or amount >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('workout', 'hydration', 'sleep', 'checkin', 'reactivation')),
  enabled boolean not null default true,
  channel text not null default 'push' check (channel in ('push', 'email', 'whatsapp', 'in_app')),
  schedule jsonb not null default '{}'::jsonb,
  message text not null,
  next_run_at timestamptz,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, reminder_type)
);

create table if not exists public.consistency_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration_days integer not null check (duration_days in (7, 14, 30)),
  title text not null,
  starts_on date not null,
  ends_on date not null,
  target_days integer not null check (target_days > 0),
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create table if not exists public.retention_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null,
  badge_name text not null,
  badge_description text not null,
  emoji text not null default '',
  category text not null,
  source text not null default 'retention_service',
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table if not exists public.onboarding_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_step integer not null default 0 check (current_step >= 0),
  total_steps integer not null default 1 check (total_steps >= 1),
  payload jsonb not null default '{}'::jsonb,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  check (current_step <= total_steps)
);

create table if not exists public.automated_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message_type text not null check (message_type in ('daily_checkin', 'reactivation', 'coach_followup')),
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'cancelled')),
  subject text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alternative_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  duration_minutes integer not null check (duration_minutes between 5 and 90),
  focus text not null,
  intensity text not null check (intensity in ('low', 'moderate', 'high')),
  exercises text[] not null default array[]::text[],
  reason text not null,
  status text not null default 'suggested' check (status in ('suggested', 'scheduled', 'completed', 'dismissed')),
  suggested_for date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_calendar_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('workout', 'checkin', 'recovery', 'assessment')),
  title text not null,
  scheduled_for date not null,
  time_of_day text,
  status text not null default 'scheduled' check (status in ('scheduled', 'done', 'skipped', 'cancelled')),
  source text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_integrations (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (
    provider in ('apple_health', 'google_fit', 'garmin', 'fitbit', 'ble_hr', 'strava', 'health_connect')
  ),
  status text not null default 'needs_config' check (status in ('connected', 'needs_config', 'revoked', 'error')),
  data_mode text not null check (data_mode in ('supabase', 'native', 'oauth', 'csv', 'ble', 'external_pending')),
  scopes text[] not null default array[]::text[],
  last_sync_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, provider)
);

create table if not exists public.white_label_tenants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  brand_name text not null,
  slug text not null,
  primary_color text not null default '#a3e635',
  logo_url text,
  support_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'retention_profiles_tenant_fk'
  ) then
    alter table public.retention_profiles
      add constraint retention_profiles_tenant_fk
      foreign key (white_label_tenant_id) references public.white_label_tenants(id) on delete set null;
  end if;
end $$;

create table if not exists public.tenant_students (
  tenant_id uuid not null references public.white_label_tenants(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'invited' check (status in ('invited', 'active', 'paused', 'archived')),
  assigned_at timestamptz not null default now(),
  primary key (tenant_id, student_id)
);

create table if not exists public.student_assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.white_label_tenants(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid not null references auth.users(id) on delete cascade,
  assessment_type text not null check (assessment_type in ('initial', 'progress', 'risk', 'adherence')),
  score numeric check (score is null or (score >= 0 and score <= 100)),
  notes text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.student_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.white_label_tenants(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  channel text not null default 'in_app' check (channel in ('push', 'email', 'whatsapp', 'in_app')),
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists habit_events_user_date_idx
  on public.habit_events (user_id, event_date desc, created_at desc);

create index if not exists consistency_challenges_user_status_idx
  on public.consistency_challenges (user_id, status, ends_on desc);

create index if not exists automated_checkins_user_schedule_idx
  on public.automated_checkins (user_id, scheduled_for desc);

create index if not exists workout_calendar_items_user_schedule_idx
  on public.workout_calendar_items (user_id, scheduled_for asc);

create index if not exists tenant_students_coach_idx
  on public.tenant_students (coach_id, status);

create index if not exists student_assessments_tenant_created_idx
  on public.student_assessments (tenant_id, created_at desc);

alter table public.retention_profiles enable row level security;
alter table public.user_streaks enable row level security;
alter table public.habit_events enable row level security;
alter table public.habit_reminders enable row level security;
alter table public.consistency_challenges enable row level security;
alter table public.retention_badges enable row level security;
alter table public.onboarding_progress enable row level security;
alter table public.automated_checkins enable row level security;
alter table public.alternative_workouts enable row level security;
alter table public.workout_calendar_items enable row level security;
alter table public.health_integrations enable row level security;
alter table public.white_label_tenants enable row level security;
alter table public.tenant_students enable row level security;
alter table public.student_assessments enable row level security;
alter table public.student_messages enable row level security;

drop policy if exists retention_profiles_own_all on public.retention_profiles;
create policy retention_profiles_own_all on public.retention_profiles
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists user_streaks_own_all on public.user_streaks;
create policy user_streaks_own_all on public.user_streaks
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists habit_events_own_all on public.habit_events;
create policy habit_events_own_all on public.habit_events
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists habit_reminders_own_all on public.habit_reminders;
create policy habit_reminders_own_all on public.habit_reminders
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists consistency_challenges_own_all on public.consistency_challenges;
create policy consistency_challenges_own_all on public.consistency_challenges
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists retention_badges_own_all on public.retention_badges;
create policy retention_badges_own_all on public.retention_badges
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists onboarding_progress_own_all on public.onboarding_progress;
create policy onboarding_progress_own_all on public.onboarding_progress
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists automated_checkins_own_all on public.automated_checkins;
create policy automated_checkins_own_all on public.automated_checkins
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists alternative_workouts_own_all on public.alternative_workouts;
create policy alternative_workouts_own_all on public.alternative_workouts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists workout_calendar_items_own_all on public.workout_calendar_items;
create policy workout_calendar_items_own_all on public.workout_calendar_items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists health_integrations_own_all on public.health_integrations;
create policy health_integrations_own_all on public.health_integrations
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists white_label_tenants_owner_all on public.white_label_tenants;
create policy white_label_tenants_owner_all on public.white_label_tenants
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists tenant_students_read_related on public.tenant_students;
create policy tenant_students_read_related on public.tenant_students
for select using (
  auth.uid() = student_id
  or auth.uid() = coach_id
  or exists (
    select 1 from public.white_label_tenants tenants
    where tenants.id = tenant_id and tenants.owner_id = auth.uid()
  )
);

drop policy if exists tenant_students_write_owner_coach on public.tenant_students;
create policy tenant_students_write_owner_coach on public.tenant_students
for all using (
  auth.uid() = coach_id
  or exists (
    select 1 from public.white_label_tenants tenants
    where tenants.id = tenant_id and tenants.owner_id = auth.uid()
  )
) with check (
  auth.uid() = coach_id
  or exists (
    select 1 from public.white_label_tenants tenants
    where tenants.id = tenant_id and tenants.owner_id = auth.uid()
  )
);

drop policy if exists student_assessments_read_related on public.student_assessments;
create policy student_assessments_read_related on public.student_assessments
for select using (
  auth.uid() = student_id
  or auth.uid() = coach_id
  or exists (
    select 1 from public.white_label_tenants tenants
    where tenants.id = tenant_id and tenants.owner_id = auth.uid()
  )
);

drop policy if exists student_assessments_insert_coach on public.student_assessments;
create policy student_assessments_insert_coach on public.student_assessments
for insert with check (
  auth.uid() = coach_id
  and exists (
    select 1 from public.white_label_tenants tenants
    where tenants.id = tenant_id and tenants.owner_id = auth.uid()
  )
);

drop policy if exists student_messages_read_related on public.student_messages;
create policy student_messages_read_related on public.student_messages
for select using (
  auth.uid() = student_id
  or auth.uid() = coach_id
  or exists (
    select 1 from public.white_label_tenants tenants
    where tenants.id = tenant_id and tenants.owner_id = auth.uid()
  )
);

drop policy if exists student_messages_insert_coach on public.student_messages;
create policy student_messages_insert_coach on public.student_messages
for insert with check (
  auth.uid() = coach_id
  and exists (
    select 1 from public.white_label_tenants tenants
    where tenants.id = tenant_id and tenants.owner_id = auth.uid()
  )
);
