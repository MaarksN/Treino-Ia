create extension if not exists pgcrypto;

create table if not exists public.recovery_daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  sleep_hours numeric not null check (sleep_hours >= 0 and sleep_hours <= 14),
  sleep_quality integer not null check (sleep_quality between 1 and 5),
  stress_level integer not null check (stress_level between 1 and 10),
  soreness_map jsonb not null default '{}'::jsonb,
  energy_level integer not null check (energy_level between 1 and 10),
  hydration_glasses integer not null default 0 check (hydration_glasses between 0 and 30),
  sleep_goal_hours numeric not null default 8 check (sleep_goal_hours >= 4 and sleep_goal_hours <= 12),
  notes text check (notes is null or char_length(notes) <= 2000),
  readiness_score integer check (readiness_score between 0 and 100),
  readiness_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.health_injury_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  region text not null check (char_length(region) between 2 and 80),
  description text not null check (char_length(description) between 3 and 500),
  severity text not null check (severity in ('leve', 'moderada', 'grave')),
  start_date date not null,
  resolved boolean not null default false,
  resolved_date date,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_symptom_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  region text not null check (char_length(region) between 2 and 80),
  symptom text not null check (char_length(symptom) between 3 and 500),
  intensity integer not null check (intensity between 1 and 10),
  created_at timestamptz not null default now()
);

create table if not exists public.nutrition_macro_targets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_goal text not null,
  calories integer not null check (calories between 800 and 8000),
  protein integer not null check (protein between 0 and 500),
  carbs integer not null check (carbs between 0 and 1000),
  fat integer not null check (fat between 0 and 400),
  plan_text text check (plan_text is null or char_length(plan_text) <= 6000),
  data_source text not null default 'deterministic' check (data_source in ('deterministic', 'ai_proxy')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nutrition_meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('Café da manhã', 'Almoço', 'Jantar', 'Lanche', 'Pré-treino', 'Pós-treino')),
  description text not null check (char_length(description) between 2 and 1000),
  estimated_calories integer check (estimated_calories >= 0 and estimated_calories <= 5000),
  estimated_protein numeric check (estimated_protein >= 0 and estimated_protein <= 400),
  estimated_carbs numeric check (estimated_carbs >= 0 and estimated_carbs <= 800),
  estimated_fat numeric check (estimated_fat >= 0 and estimated_fat <= 300),
  ai_analysis text check (ai_analysis is null or char_length(ai_analysis) <= 4000),
  photo_analyzed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.nutrition_favorite_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  calories integer not null check (calories >= 0 and calories <= 5000),
  protein numeric not null check (protein >= 0 and protein <= 400),
  carbs numeric not null check (carbs >= 0 and carbs <= 800),
  fat numeric not null check (fat >= 0 and fat <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hydration_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  time text not null,
  amount_ml integer not null check (amount_ml between 1 and 5000),
  type text not null check (type in ('água', 'isotônico', 'whey', 'café', 'outro')),
  created_at timestamptz not null default now()
);

create table if not exists public.hydration_goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_ml integer not null check (daily_ml between 250 and 10000),
  remind_every_minutes integer not null default 60 check (remind_every_minutes between 0 and 720),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  bedtime text not null,
  wake_time text not null,
  duration_minutes integer not null check (duration_minutes between 0 and 960),
  quality integer not null check (quality between 1 and 5),
  notes text check (notes is null or char_length(notes) <= 1000),
  deep_sleep_pct numeric check (deep_sleep_pct is null or (deep_sleep_pct >= 0 and deep_sleep_pct <= 100)),
  rem_sleep_pct numeric check (rem_sleep_pct is null or (rem_sleep_pct >= 0 and rem_sleep_pct <= 100)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists recovery_daily_checkins_user_date_idx
  on public.recovery_daily_checkins (user_id, date desc);

create index if not exists health_injury_records_user_resolved_idx
  on public.health_injury_records (user_id, resolved, start_date desc);

create index if not exists health_symptom_records_user_date_idx
  on public.health_symptom_records (user_id, date desc);

create index if not exists nutrition_meal_entries_user_date_idx
  on public.nutrition_meal_entries (user_id, date desc);

create index if not exists nutrition_favorite_foods_user_name_idx
  on public.nutrition_favorite_foods (user_id, lower(name));

create index if not exists hydration_entries_user_date_idx
  on public.hydration_entries (user_id, date desc);

create index if not exists sleep_entries_user_date_idx
  on public.sleep_entries (user_id, date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recovery_daily_checkins_updated_at on public.recovery_daily_checkins;
create trigger recovery_daily_checkins_updated_at
  before update on public.recovery_daily_checkins
  for each row execute function public.set_updated_at();

drop trigger if exists health_injury_records_updated_at on public.health_injury_records;
create trigger health_injury_records_updated_at
  before update on public.health_injury_records
  for each row execute function public.set_updated_at();

drop trigger if exists nutrition_macro_targets_updated_at on public.nutrition_macro_targets;
create trigger nutrition_macro_targets_updated_at
  before update on public.nutrition_macro_targets
  for each row execute function public.set_updated_at();

drop trigger if exists nutrition_favorite_foods_updated_at on public.nutrition_favorite_foods;
create trigger nutrition_favorite_foods_updated_at
  before update on public.nutrition_favorite_foods
  for each row execute function public.set_updated_at();

drop trigger if exists hydration_goals_updated_at on public.hydration_goals;
create trigger hydration_goals_updated_at
  before update on public.hydration_goals
  for each row execute function public.set_updated_at();

drop trigger if exists sleep_entries_updated_at on public.sleep_entries;
create trigger sleep_entries_updated_at
  before update on public.sleep_entries
  for each row execute function public.set_updated_at();

alter table public.recovery_daily_checkins enable row level security;
alter table public.health_injury_records enable row level security;
alter table public.health_symptom_records enable row level security;
alter table public.nutrition_macro_targets enable row level security;
alter table public.nutrition_meal_entries enable row level security;
alter table public.nutrition_favorite_foods enable row level security;
alter table public.hydration_entries enable row level security;
alter table public.hydration_goals enable row level security;
alter table public.sleep_entries enable row level security;

drop policy if exists recovery_daily_checkins_own_select on public.recovery_daily_checkins;
create policy recovery_daily_checkins_own_select on public.recovery_daily_checkins
  for select using (auth.uid() = user_id);

drop policy if exists recovery_daily_checkins_own_insert on public.recovery_daily_checkins;
create policy recovery_daily_checkins_own_insert on public.recovery_daily_checkins
  for insert with check (auth.uid() = user_id);

drop policy if exists recovery_daily_checkins_own_update on public.recovery_daily_checkins;
create policy recovery_daily_checkins_own_update on public.recovery_daily_checkins
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists health_injury_records_own_select on public.health_injury_records;
create policy health_injury_records_own_select on public.health_injury_records
  for select using (auth.uid() = user_id);

drop policy if exists health_injury_records_own_insert on public.health_injury_records;
create policy health_injury_records_own_insert on public.health_injury_records
  for insert with check (auth.uid() = user_id);

drop policy if exists health_injury_records_own_update on public.health_injury_records;
create policy health_injury_records_own_update on public.health_injury_records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists health_symptom_records_own_select on public.health_symptom_records;
create policy health_symptom_records_own_select on public.health_symptom_records
  for select using (auth.uid() = user_id);

drop policy if exists health_symptom_records_own_insert on public.health_symptom_records;
create policy health_symptom_records_own_insert on public.health_symptom_records
  for insert with check (auth.uid() = user_id);

drop policy if exists nutrition_macro_targets_own_select on public.nutrition_macro_targets;
create policy nutrition_macro_targets_own_select on public.nutrition_macro_targets
  for select using (auth.uid() = user_id);

drop policy if exists nutrition_macro_targets_own_insert on public.nutrition_macro_targets;
create policy nutrition_macro_targets_own_insert on public.nutrition_macro_targets
  for insert with check (auth.uid() = user_id);

drop policy if exists nutrition_macro_targets_own_update on public.nutrition_macro_targets;
create policy nutrition_macro_targets_own_update on public.nutrition_macro_targets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists nutrition_meal_entries_own_select on public.nutrition_meal_entries;
create policy nutrition_meal_entries_own_select on public.nutrition_meal_entries
  for select using (auth.uid() = user_id);

drop policy if exists nutrition_meal_entries_own_insert on public.nutrition_meal_entries;
create policy nutrition_meal_entries_own_insert on public.nutrition_meal_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists nutrition_favorite_foods_own_select on public.nutrition_favorite_foods;
create policy nutrition_favorite_foods_own_select on public.nutrition_favorite_foods
  for select using (auth.uid() = user_id);

drop policy if exists nutrition_favorite_foods_own_insert on public.nutrition_favorite_foods;
create policy nutrition_favorite_foods_own_insert on public.nutrition_favorite_foods
  for insert with check (auth.uid() = user_id);

drop policy if exists nutrition_favorite_foods_own_update on public.nutrition_favorite_foods;
create policy nutrition_favorite_foods_own_update on public.nutrition_favorite_foods
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists hydration_entries_own_select on public.hydration_entries;
create policy hydration_entries_own_select on public.hydration_entries
  for select using (auth.uid() = user_id);

drop policy if exists hydration_entries_own_insert on public.hydration_entries;
create policy hydration_entries_own_insert on public.hydration_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists hydration_goals_own_select on public.hydration_goals;
create policy hydration_goals_own_select on public.hydration_goals
  for select using (auth.uid() = user_id);

drop policy if exists hydration_goals_own_insert on public.hydration_goals;
create policy hydration_goals_own_insert on public.hydration_goals
  for insert with check (auth.uid() = user_id);

drop policy if exists hydration_goals_own_update on public.hydration_goals;
create policy hydration_goals_own_update on public.hydration_goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists sleep_entries_own_select on public.sleep_entries;
create policy sleep_entries_own_select on public.sleep_entries
  for select using (auth.uid() = user_id);

drop policy if exists sleep_entries_own_insert on public.sleep_entries;
create policy sleep_entries_own_insert on public.sleep_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists sleep_entries_own_update on public.sleep_entries;
create policy sleep_entries_own_update on public.sleep_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
