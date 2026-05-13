
-- Backend gamification tables for profiles, ledger, missions, cosmetics, avatars, clan and season passes.
-- (Extends existing logic expected in api/gamification/state.ts)

create table if not exists public.gamification_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp bigint not null default 0,
  level int not null default 1,
  coins bigint not null default 0,
  login_streak int not null default 0,
  last_login_at timestamptz,
  last_checkin_at timestamptz,
  active_title text not null default 'Iniciante',
  season_xp bigint not null default 0,
  season_level int not null default 1,
  elite_pass_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gamification_profiles enable row level security;
drop policy if exists gamification_profiles_select on public.gamification_profiles;
create policy gamification_profiles_select on public.gamification_profiles for select using (auth.uid() = user_id);

create table if not exists public.gamification_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  source_id text,
  xp_delta int not null,
  coin_delta int not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists gamification_ledger_user_created_idx on public.gamification_ledger(user_id, created_at desc);

alter table public.gamification_ledger enable row level security;
drop policy if exists gamification_ledger_select on public.gamification_ledger;
create policy gamification_ledger_select on public.gamification_ledger for select using (auth.uid() = user_id);

create table if not exists public.gamification_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_type text not null,
  title text not null,
  description text not null,
  metric text not null,
  target int not null,
  progress int not null default 0,
  xp_reward int not null,
  coin_reward int not null default 0,
  status text not null default 'active',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gamification_missions enable row level security;
drop policy if exists gamification_missions_select on public.gamification_missions;
create policy gamification_missions_select on public.gamification_missions for select using (auth.uid() = user_id);

create table if not exists public.gamification_cosmetics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cosmetic_id text not null,
  cosmetic_type text not null,
  equipped boolean not null default false,
  unlocked_at timestamptz not null default now(),
  unique (user_id, cosmetic_id)
);

alter table public.gamification_cosmetics enable row level security;
drop policy if exists gamification_cosmetics_select on public.gamification_cosmetics;
create policy gamification_cosmetics_select on public.gamification_cosmetics for select using (auth.uid() = user_id);

create table if not exists public.gamification_avatars (
  user_id uuid primary key references auth.users(id) on delete cascade,
  archetype text not null default 'rookie',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gamification_avatars enable row level security;
drop policy if exists gamification_avatars_select on public.gamification_avatars;
create policy gamification_avatars_select on public.gamification_avatars for select using (auth.uid() = user_id);

create table if not exists public.gamification_clans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text not null unique,
  weekly_xp bigint not null default 0,
  boss_damage bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gamification_clans enable row level security;
drop policy if exists gamification_clans_select on public.gamification_clans;
create policy gamification_clans_select on public.gamification_clans for select to authenticated using (true);

create table if not exists public.gamification_clan_members (
  clan_id uuid not null references public.gamification_clans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (clan_id, user_id)
);

alter table public.gamification_clan_members enable row level security;
drop policy if exists gamification_clan_members_select on public.gamification_clan_members;
create policy gamification_clan_members_select on public.gamification_clan_members for select to authenticated using (true);

-- RPC for ledger
create or replace function apply_gamification_event(
  p_user_id uuid,
  p_event_type text,
  p_source_id text,
  p_xp_delta int,
  p_coin_delta int,
  p_metadata jsonb
) returns jsonb language plpgsql security definer as $$
declare
  v_profile record;
  v_new_level int;
  v_ledger_id uuid;
begin
  insert into gamification_ledger(user_id, event_type, source_id, xp_delta, coin_delta, metadata)
  values (p_user_id, p_event_type, p_source_id, p_xp_delta, p_coin_delta, p_metadata)
  returning id into v_ledger_id;

  insert into gamification_profiles (user_id, xp, coins, season_xp)
  values (p_user_id, p_xp_delta, p_coin_delta, p_xp_delta)
  on conflict (user_id) do update set
    xp = gamification_profiles.xp + p_xp_delta,
    coins = gamification_profiles.coins + p_coin_delta,
    season_xp = gamification_profiles.season_xp + p_xp_delta,
    updated_at = now()
  returning * into v_profile;

  v_new_level := floor(v_profile.xp / 300) + 1;

  if v_new_level > v_profile.level then
    update gamification_profiles set level = v_new_level where user_id = p_user_id returning * into v_profile;
  end if;

  return row_to_json(v_profile)::jsonb;
end;
$$;


-- Add additional indexes
create index if not exists gamification_missions_user_created_idx on public.gamification_missions(user_id, created_at desc);
create index if not exists gamification_cosmetics_user_idx on public.gamification_cosmetics(user_id);
create index if not exists gamification_profiles_season_idx on public.gamification_profiles(season_xp desc);

-- RPC for purchasing a cosmetic item atomically
create or replace function purchase_gamification_item(
  p_user_id uuid,
  p_item_id text,
  p_cost int
) returns jsonb language plpgsql security definer as $$
declare
  v_profile record;
  v_ledger_id uuid;
begin
  select * into v_profile from gamification_profiles where user_id = p_user_id for update;

  if v_profile.coins < p_cost then
    raise exception 'Saldo insuficiente';
  end if;

  update gamification_profiles
  set coins = coins - p_cost,
      updated_at = now()
  where user_id = p_user_id
  returning * into v_profile;

  insert into gamification_ledger(user_id, event_type, source_id, xp_delta, coin_delta, metadata)
  values (p_user_id, 'item_purchased', p_item_id, 0, -p_cost, jsonb_build_object('item', p_item_id));

  insert into gamification_cosmetics(user_id, cosmetic_id, cosmetic_type)
  values (p_user_id, p_item_id, 'title')
  on conflict (user_id, cosmetic_id) do nothing;

  return row_to_json(v_profile)::jsonb;
end;
$$;

-- RPC for opening a loot box atomically
create or replace function open_loot_box(
  p_user_id uuid,
  p_cost int
) returns jsonb language plpgsql security definer as $$
declare
  v_profile record;
  v_ledger_id uuid;
  v_xp_reward int;
  v_coin_reward int;
begin
  select * into v_profile from gamification_profiles where user_id = p_user_id for update;

  if v_profile.coins < p_cost then
    raise exception 'Saldo insuficiente';
  end if;

  v_xp_reward := 20 + floor(random() * 30);
  v_coin_reward := 0;
  if random() < 0.1 then
     v_coin_reward := p_cost * 2;
  end if;

  update gamification_profiles
  set coins = coins - p_cost + v_coin_reward,
      xp = xp + v_xp_reward,
      season_xp = season_xp + v_xp_reward,
      updated_at = now()
  where user_id = p_user_id
  returning * into v_profile;

  insert into gamification_ledger(user_id, event_type, xp_delta, coin_delta, metadata)
  values (p_user_id, 'loot_box_opened', v_xp_reward, -p_cost + v_coin_reward, jsonb_build_object('cost', p_cost, 'won_coins', v_coin_reward));

  return row_to_json(v_profile)::jsonb;
end;
$$;
