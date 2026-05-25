-- Release stabilization: version schema used by health, nutrition, retention and social services.

create extension if not exists pgcrypto;

-- Health and nutrition -------------------------------------------------------

create table if not exists public.recovery_daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  sleep_hours numeric not null default 0,
  sleep_quality integer not null default 3,
  stress_level integer not null default 5,
  soreness_map jsonb not null default '{}'::jsonb,
  energy_level integer not null default 5,
  hydration_glasses integer not null default 0,
  sleep_goal_hours numeric not null default 8,
  notes text,
  readiness_score numeric,
  readiness_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.health_injury_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  region text not null,
  description text not null,
  severity text not null default 'leve',
  start_date date not null default current_date,
  resolved boolean not null default false,
  resolved_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_symptom_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  region text not null,
  symptom text not null,
  intensity integer not null default 5,
  created_at timestamptz not null default now()
);

create table if not exists public.nutrition_macro_targets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_goal text not null default '',
  calories integer not null default 2000,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  plan_text text,
  data_source text not null default 'deterministic',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nutrition_meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  meal_type text not null,
  description text not null,
  estimated_calories integer,
  estimated_protein numeric,
  estimated_carbs numeric,
  estimated_fat numeric,
  ai_analysis text,
  photo_analyzed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.nutrition_favorite_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  calories integer not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.hydration_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  time text not null default '08:00',
  amount_ml integer not null default 0,
  type text not null default 'agua',
  created_at timestamptz not null default now()
);

create table if not exists public.hydration_goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_ml integer not null default 2500,
  remind_every_minutes integer not null default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  bedtime text not null default '22:00',
  wake_time text not null default '06:00',
  duration_minutes integer not null default 0,
  quality integer not null default 3,
  notes text,
  deep_sleep_pct numeric,
  rem_sleep_pct numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Retention ------------------------------------------------------------------

create table if not exists public.retention_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  consistency_workouts_per_week integer not null default 3,
  consistency_checkins_per_week integer not null default 4,
  hydration_goal_ml integer not null default 2500,
  sleep_goal_minutes integer not null default 480,
  preferred_workout_time text not null default '18:00',
  quiet_hours_start text not null default '22:00',
  quiet_hours_end text not null default '07:00',
  last_activity_at timestamptz,
  white_label_tenant_id uuid,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_streak integer not null default 0,
  weekly_streak integer not null default 0,
  best_daily_streak integer not null default 0,
  best_weekly_streak integer not null default 0,
  last_activity_date date,
  active_week_start date,
  weekly_workouts integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.habit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_date date not null default current_date,
  amount numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_type text not null,
  enabled boolean not null default true,
  channel text not null default 'in_app',
  schedule jsonb not null default '{}'::jsonb,
  message text not null default '',
  next_run_at timestamptz,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, reminder_type)
);

create table if not exists public.consistency_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration_days integer not null default 7,
  title text not null,
  starts_on date not null default current_date,
  ends_on date not null default current_date,
  target_days integer not null default 7,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.retention_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null,
  badge_name text not null,
  badge_description text not null default '',
  emoji text not null default '',
  category text not null default 'retention',
  source text not null default 'retention_service',
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table if not exists public.onboarding_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_step integer not null default 0,
  total_steps integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.automated_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message_type text not null default 'daily_checkin',
  scheduled_for timestamptz not null default now(),
  status text not null default 'pending',
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
  duration_minutes integer not null,
  focus text not null,
  intensity text not null default 'moderate',
  exercises text[] not null default array[]::text[],
  reason text not null,
  status text not null default 'suggested',
  suggested_for date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_calendar_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null default 'workout',
  title text not null,
  scheduled_for date not null default current_date,
  time_of_day text,
  status text not null default 'scheduled',
  source text not null default 'app',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_integrations (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  status text not null default 'needs_config',
  data_mode text not null default 'external_pending',
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
  primary_color text not null default '#19a7ff',
  logo_url text,
  support_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create table if not exists public.tenant_students (
  tenant_id uuid not null references public.white_label_tenants(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'invited',
  assigned_at timestamptz not null default now(),
  primary key (tenant_id, student_id)
);

create table if not exists public.student_assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.white_label_tenants(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid not null references auth.users(id) on delete cascade,
  assessment_type text not null default 'progress',
  score numeric,
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
  channel text not null default 'in_app',
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

-- Social ---------------------------------------------------------------------

create table if not exists public.social_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  display_name text,
  bio text,
  avatar_url text,
  city text,
  goal text,
  is_coach boolean not null default false,
  is_public boolean not null default true,
  total_workouts integer not null default 0,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  total_volume numeric not null default 0,
  weekly_volume numeric not null default 0,
  followers_count integer not null default 0,
  following_count integer not null default 0,
  badges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_profiles add column if not exists username text;
alter table public.social_profiles add column if not exists display_name text;
alter table public.social_profiles add column if not exists bio text;
alter table public.social_profiles add column if not exists avatar_url text;
alter table public.social_profiles add column if not exists city text;
alter table public.social_profiles add column if not exists goal text;
alter table public.social_profiles add column if not exists is_coach boolean not null default false;
alter table public.social_profiles add column if not exists total_workouts integer not null default 0;
alter table public.social_profiles add column if not exists current_streak integer not null default 0;
alter table public.social_profiles add column if not exists best_streak integer not null default 0;
alter table public.social_profiles add column if not exists total_volume numeric not null default 0;
alter table public.social_profiles add column if not exists weekly_volume numeric not null default 0;
alter table public.social_profiles add column if not exists followers_count integer not null default 0;
alter table public.social_profiles add column if not exists following_count integer not null default 0;
alter table public.social_profiles add column if not exists badges jsonb not null default '[]'::jsonb;
alter table public.social_profiles add column if not exists updated_at timestamptz not null default now();

create unique index if not exists social_profiles_username_unique_idx
  on public.social_profiles (username)
  where username is not null;

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.social_profiles(id) on delete cascade,
  type text not null default 'text',
  title text not null default 'Post',
  body text,
  metric_label text,
  metric_value text,
  visibility text not null default 'public',
  group_id uuid,
  workout_template_id uuid,
  created_at timestamptz not null default now()
);

alter table public.social_posts add column if not exists type text not null default 'text';
alter table public.social_posts add column if not exists title text not null default 'Post';
alter table public.social_posts add column if not exists body text;
alter table public.social_posts add column if not exists metric_label text;
alter table public.social_posts add column if not exists metric_value text;
alter table public.social_posts add column if not exists workout_template_id uuid;

create table if not exists public.social_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_posts(id) on delete cascade,
  author_id uuid not null references public.social_profiles(id) on delete cascade,
  body text not null default '',
  created_at timestamptz not null default now()
);

alter table public.social_post_comments add column if not exists body text not null default '';

create table if not exists public.social_follows (
  follower_id uuid not null references public.social_profiles(id) on delete cascade,
  following_id uuid not null references public.social_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create table if not exists public.social_post_likes (
  post_id uuid not null references public.social_posts(id) on delete cascade,
  user_id uuid not null references public.social_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.training_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.social_profiles(id) on delete cascade,
  name text not null,
  description text,
  invite_code text unique,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_group_members (
  group_id uuid not null references public.training_groups(id) on delete cascade,
  user_id uuid not null references public.social_profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.training_group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.training_groups(id) on delete cascade,
  author_id uuid not null references public.social_profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.training_groups(id) on delete cascade,
  name text not null,
  description text,
  target numeric not null,
  metric text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  badge_reward text,
  created_at timestamptz not null default now()
);

create table if not exists public.coach_students (
  coach_id uuid not null references public.social_profiles(id) on delete cascade,
  student_id uuid not null references public.social_profiles(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  primary key (coach_id, student_id)
);

create table if not exists public.coach_private_notes (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.social_profiles(id) on delete cascade,
  student_id uuid not null references public.social_profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.coach_workout_assignments (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.social_profiles(id) on delete cascade,
  student_id uuid not null references public.social_profiles(id) on delete cascade,
  title text not null,
  workout_json jsonb not null default '{}'::jsonb,
  status text not null default 'assigned',
  created_at timestamptz not null default now()
);

create table if not exists public.public_workout_templates (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.social_profiles(id) on delete cascade,
  title text not null default 'Template',
  description text,
  goal text,
  level text,
  workout_json jsonb not null default '{}'::jsonb,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.public_workout_templates add column if not exists title text not null default 'Template';
alter table public.public_workout_templates add column if not exists description text;
alter table public.public_workout_templates add column if not exists goal text;
alter table public.public_workout_templates add column if not exists level text;
alter table public.public_workout_templates add column if not exists workout_json jsonb not null default '{}'::jsonb;
alter table public.public_workout_templates add column if not exists likes_count integer not null default 0;

-- Indexes --------------------------------------------------------------------

create index if not exists recovery_daily_checkins_user_date_idx on public.recovery_daily_checkins (user_id, date desc);
create index if not exists health_injury_records_user_start_idx on public.health_injury_records (user_id, start_date desc);
create index if not exists health_symptom_records_user_date_idx on public.health_symptom_records (user_id, date desc);
create index if not exists nutrition_meal_entries_user_date_idx on public.nutrition_meal_entries (user_id, date desc);
create index if not exists nutrition_favorite_foods_user_name_idx on public.nutrition_favorite_foods (user_id, name);
create index if not exists hydration_entries_user_date_idx on public.hydration_entries (user_id, date desc);
create index if not exists sleep_entries_user_date_idx on public.sleep_entries (user_id, date desc);
create index if not exists habit_events_user_date_idx on public.habit_events (user_id, event_date desc, created_at desc);
create index if not exists habit_reminders_user_type_idx on public.habit_reminders (user_id, reminder_type);
create index if not exists automated_checkins_user_schedule_idx on public.automated_checkins (user_id, scheduled_for desc);
create index if not exists alternative_workouts_user_created_idx on public.alternative_workouts (user_id, created_at desc);
create index if not exists workout_calendar_items_user_schedule_idx on public.workout_calendar_items (user_id, scheduled_for);
create index if not exists white_label_tenants_owner_idx on public.white_label_tenants (owner_id, created_at desc);
create index if not exists tenant_students_tenant_assigned_idx on public.tenant_students (tenant_id, assigned_at desc);
create index if not exists social_profiles_volume_idx on public.social_profiles (total_volume desc);
create index if not exists social_posts_author_created_idx on public.social_posts (author_id, created_at desc);
create index if not exists social_posts_public_created_idx on public.social_posts (visibility, created_at desc);
create index if not exists training_group_members_user_idx on public.training_group_members (user_id, joined_at desc);
create index if not exists training_group_messages_group_created_idx on public.training_group_messages (group_id, created_at);
create index if not exists group_challenges_group_created_idx on public.group_challenges (group_id, created_at desc);

-- RLS ------------------------------------------------------------------------

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'recovery_daily_checkins',
    'health_injury_records',
    'health_symptom_records',
    'nutrition_macro_targets',
    'nutrition_meal_entries',
    'nutrition_favorite_foods',
    'hydration_entries',
    'hydration_goals',
    'sleep_entries',
    'retention_profiles',
    'user_streaks',
    'habit_events',
    'habit_reminders',
    'consistency_challenges',
    'retention_badges',
    'onboarding_progress',
    'automated_checkins',
    'alternative_workouts',
    'workout_calendar_items',
    'health_integrations'
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

alter table public.white_label_tenants enable row level security;
alter table public.tenant_students enable row level security;
alter table public.student_assessments enable row level security;
alter table public.student_messages enable row level security;
alter table public.social_profiles enable row level security;
alter table public.social_posts enable row level security;
alter table public.social_post_comments enable row level security;
alter table public.social_follows enable row level security;
alter table public.social_post_likes enable row level security;
alter table public.training_groups enable row level security;
alter table public.training_group_members enable row level security;
alter table public.training_group_messages enable row level security;
alter table public.group_challenges enable row level security;
alter table public.coach_students enable row level security;
alter table public.coach_private_notes enable row level security;
alter table public.coach_workout_assignments enable row level security;
alter table public.public_workout_templates enable row level security;

drop policy if exists white_label_tenants_owner_all on public.white_label_tenants;
create policy white_label_tenants_owner_all on public.white_label_tenants
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists tenant_students_related_select on public.tenant_students;
drop policy if exists tenant_students_coach_insert on public.tenant_students;
create policy tenant_students_related_select on public.tenant_students
  for select using (auth.uid() = student_id or auth.uid() = coach_id);
create policy tenant_students_coach_insert on public.tenant_students
  for insert with check (auth.uid() = coach_id);

drop policy if exists student_assessments_related_all on public.student_assessments;
create policy student_assessments_related_all on public.student_assessments
  for all using (auth.uid() = student_id or auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

drop policy if exists student_messages_related_all on public.student_messages;
create policy student_messages_related_all on public.student_messages
  for all using (auth.uid() = student_id or auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

drop policy if exists social_profiles_public_or_self_select on public.social_profiles;
drop policy if exists social_profiles_self_insert on public.social_profiles;
drop policy if exists social_profiles_self_update on public.social_profiles;
create policy social_profiles_public_or_self_select on public.social_profiles
  for select using (is_public = true or auth.uid() = id);
create policy social_profiles_self_insert on public.social_profiles
  for insert with check (auth.uid() = id);
create policy social_profiles_self_update on public.social_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists social_posts_visible_select on public.social_posts;
drop policy if exists social_posts_author_insert on public.social_posts;
drop policy if exists social_posts_author_update on public.social_posts;
create policy social_posts_visible_select on public.social_posts
  for select using (
    visibility = 'public'
    or author_id = auth.uid()
    or (visibility = 'group' and public.is_training_group_member(group_id, auth.uid()))
  );
create policy social_posts_author_insert on public.social_posts
  for insert with check (auth.uid() = author_id);
create policy social_posts_author_update on public.social_posts
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists social_comments_visible_select on public.social_post_comments;
drop policy if exists social_comments_author_insert on public.social_post_comments;
create policy social_comments_visible_select on public.social_post_comments
  for select using (true);
create policy social_comments_author_insert on public.social_post_comments
  for insert with check (auth.uid() = author_id);

drop policy if exists social_follows_own_all on public.social_follows;
create policy social_follows_own_all on public.social_follows
  for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

drop policy if exists social_post_likes_own_all on public.social_post_likes;
create policy social_post_likes_own_all on public.social_post_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists training_groups_member_or_public_select on public.training_groups;
drop policy if exists training_groups_owner_insert on public.training_groups;
drop policy if exists training_groups_owner_update on public.training_groups;
create policy training_groups_member_or_public_select on public.training_groups
  for select using (
    is_private = false
    or owner_id = auth.uid()
    or public.is_training_group_member(id, auth.uid())
  );
create policy training_groups_owner_insert on public.training_groups
  for insert with check (auth.uid() = owner_id);
create policy training_groups_owner_update on public.training_groups
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists training_group_members_related_select on public.training_group_members;
drop policy if exists training_group_members_self_insert on public.training_group_members;
create policy training_group_members_related_select on public.training_group_members
  for select using (auth.uid() = user_id or public.is_training_group_member(group_id, auth.uid()));
create policy training_group_members_self_insert on public.training_group_members
  for insert with check (auth.uid() = user_id);

drop policy if exists training_group_messages_member_select on public.training_group_messages;
drop policy if exists training_group_messages_member_insert on public.training_group_messages;
create policy training_group_messages_member_select on public.training_group_messages
  for select using (public.is_training_group_member(group_id, auth.uid()));
create policy training_group_messages_member_insert on public.training_group_messages
  for insert with check (auth.uid() = author_id and public.is_training_group_member(group_id, auth.uid()));

drop policy if exists group_challenges_member_select on public.group_challenges;
drop policy if exists group_challenges_member_insert on public.group_challenges;
create policy group_challenges_member_select on public.group_challenges
  for select using (public.is_training_group_member(group_id, auth.uid()));
create policy group_challenges_member_insert on public.group_challenges
  for insert with check (public.is_training_group_member(group_id, auth.uid()));

drop policy if exists coach_students_related_all on public.coach_students;
create policy coach_students_related_all on public.coach_students
  for all using (auth.uid() = coach_id or auth.uid() = student_id)
  with check (auth.uid() = coach_id);

drop policy if exists coach_private_notes_coach_all on public.coach_private_notes;
create policy coach_private_notes_coach_all on public.coach_private_notes
  for all using (auth.uid() = coach_id) with check (auth.uid() = coach_id);

drop policy if exists coach_workout_assignments_related_all on public.coach_workout_assignments;
create policy coach_workout_assignments_related_all on public.coach_workout_assignments
  for all using (auth.uid() = coach_id or auth.uid() = student_id)
  with check (auth.uid() = coach_id);

drop policy if exists public_workout_templates_public_or_author_select on public.public_workout_templates;
drop policy if exists public_workout_templates_author_insert on public.public_workout_templates;
create policy public_workout_templates_public_or_author_select on public.public_workout_templates
  for select using (true);
create policy public_workout_templates_author_insert on public.public_workout_templates
  for insert with check (auth.uid() = author_id);

-- RPCs -----------------------------------------------------------------------

create or replace function public.is_training_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.training_group_members member
    where member.group_id = p_group_id
      and member.user_id = p_user_id
  );
$$;

create or replace function public.join_training_group_by_invite(p_invite_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_group_id uuid;
  membership_exists boolean;
begin
  if current_user_id is null then
    return jsonb_build_object('success', false, 'error', 'unauthenticated');
  end if;

  select id
    into target_group_id
  from public.training_groups
  where invite_code = p_invite_code
  limit 1;

  if target_group_id is null then
    return jsonb_build_object('success', false, 'error', 'invalid_invite');
  end if;

  select exists (
    select 1
    from public.training_group_members
    where group_id = target_group_id
      and user_id = current_user_id
  ) into membership_exists;

  if membership_exists then
    return jsonb_build_object(
      'success', true,
      'group_id', target_group_id,
      'membership_status', 'already_member'
    );
  end if;

  insert into public.training_group_members (group_id, user_id, role)
  values (target_group_id, current_user_id, 'member')
  on conflict (group_id, user_id) do nothing;

  return jsonb_build_object(
    'success', true,
    'group_id', target_group_id,
    'membership_status', 'joined'
  );
end;
$$;

create or replace function public.get_group_leaderboard(
  p_group_id uuid,
  p_metric text default 'volume'
)
returns table (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  score numeric,
  workout_count integer,
  total_volume numeric,
  current_streak integer,
  total_workouts integer,
  rank bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null or not public.is_training_group_member(p_group_id, current_user_id) then
    return;
  end if;

  return query
  with members as (
    select
      member.user_id,
      coalesce(profile.username, '') as username,
      coalesce(profile.display_name, profile.username, 'Atleta') as display_name,
      profile.avatar_url,
      coalesce(profile.total_volume, 0)::numeric as total_volume,
      coalesce(profile.total_workouts, 0)::integer as total_workouts,
      coalesce(profile.current_streak, 0)::integer as current_streak
    from public.training_group_members member
    left join public.social_profiles profile on profile.id = member.user_id
    where member.group_id = p_group_id
  ),
  scored as (
    select
      members.*,
      case
        when p_metric = 'streak' then members.current_streak::numeric
        when p_metric = 'workouts' then members.total_workouts::numeric
        else members.total_volume
      end as score
    from members
  )
  select
    scored.user_id,
    scored.username,
    scored.display_name,
    scored.avatar_url,
    scored.score,
    scored.total_workouts as workout_count,
    scored.total_volume,
    scored.current_streak,
    scored.total_workouts,
    row_number() over (order by scored.score desc, scored.display_name asc) as rank
  from scored;
end;
$$;

revoke execute on function public.join_training_group_by_invite(text) from public, anon;
grant execute on function public.join_training_group_by_invite(text) to authenticated;
revoke execute on function public.get_group_leaderboard(uuid, text) from public, anon;
grant execute on function public.get_group_leaderboard(uuid, text) to authenticated;

notify pgrst, 'reload schema';
