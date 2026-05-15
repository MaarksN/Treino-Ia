alter table if exists public.user_periodization_plans
  add column if not exists user_id uuid;

alter table if exists public.user_periodization_plans
  add column if not exists week_start date;

alter table if exists public.user_periodization_plans
  add column if not exists week_end date;

do $$
begin
  if to_regclass('public.profiles') is not null then
    execute $sql$
      update public.user_periodization_plans up
      set user_id = coalesce(up.user_id, p.user_id, p.id)
      from public.profiles p
      where up.user_id is null
        and up.profile_id is not null
        and p.id = up.profile_id
    $sql$;
  end if;
end $$;

alter table public.user_periodization_plans
  alter column user_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_periodization_plans_user_id_fkey'
      and conrelid = 'public.user_periodization_plans'::regclass
  ) then
    alter table public.user_periodization_plans
      add constraint user_periodization_plans_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

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
