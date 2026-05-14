create table if not exists public.user_periodization_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid null,
  mesocycle_label text not null,
  week_start date not null,
  week_end date not null,
  workload jsonb not null default '{}'::jsonb,
  fatigue_score integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists user_periodization_plans_user_week_key
  on public.user_periodization_plans(user_id, week_start, week_end);

alter table public.user_periodization_plans enable row level security;

drop policy if exists user_periodization_plans_select_own on public.user_periodization_plans;
create policy user_periodization_plans_select_own
  on public.user_periodization_plans
  for select
  using (auth.uid() = user_id);

drop policy if exists user_periodization_plans_insert_own on public.user_periodization_plans;
create policy user_periodization_plans_insert_own
  on public.user_periodization_plans
  for insert
  with check (auth.uid() = user_id);

drop policy if exists user_periodization_plans_update_own on public.user_periodization_plans;
create policy user_periodization_plans_update_own
  on public.user_periodization_plans
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_periodization_plans_delete_own on public.user_periodization_plans;
create policy user_periodization_plans_delete_own
  on public.user_periodization_plans
  for delete
  using (auth.uid() = user_id);
