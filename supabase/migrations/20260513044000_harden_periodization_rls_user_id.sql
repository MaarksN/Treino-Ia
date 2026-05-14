-- Harden user_periodization_plans ownership to avoid relying on profile_id semantics.

alter table if exists public.user_periodization_plans
  add column if not exists user_id uuid;

DO $$
DECLARE
  has_profiles boolean;
  has_profiles_user_id boolean;
BEGIN
  select exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) into has_profiles;

  if has_profiles then
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'user_id'
    ) into has_profiles_user_id;

    if has_profiles_user_id then
      execute $q$
        update public.user_periodization_plans upp
        set user_id = p.user_id
        from public.profiles p
        where p.id = upp.profile_id and upp.user_id is null
      $q$;
    else
      update public.user_periodization_plans
      set user_id = profile_id
      where user_id is null;
    end if;
  else
    update public.user_periodization_plans
    set user_id = profile_id
    where user_id is null;
  end if;
END
$$;

alter table if exists public.user_periodization_plans
  alter column user_id set not null;

create index if not exists idx_user_periodization_plans_user_id
  on public.user_periodization_plans(user_id);

alter table if exists public.user_periodization_plans enable row level security;

drop policy if exists "Users can view their own periodization plans" on public.user_periodization_plans;
drop policy if exists "Users can insert their own periodization plans" on public.user_periodization_plans;
drop policy if exists "Users can update their own periodization plans" on public.user_periodization_plans;
drop policy if exists "Users can delete their own periodization plans" on public.user_periodization_plans;

drop policy if exists user_periodization_plans_own_all on public.user_periodization_plans;
create policy user_periodization_plans_own_all
  on public.user_periodization_plans
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
