-- Billing, Stripe webhook and server-authoritative gamification schema.
-- Run this in Supabase SQL editor or through a migration pipeline before going live.

create extension if not exists pgcrypto;

create table if not exists public.billing_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null check (plan_id in ('free', 'pro', 'coach', 'elite')) default 'free',
  status text not null check (status in ('free', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')) default 'free',
  interval text not null check (interval in ('month', 'year')) default 'month',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_usage_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  billing_month text not null,
  ai_requests integer not null default 0 check (ai_requests >= 0),
  exports_count integer not null default 0 check (exports_count >= 0),
  prs_count integer not null default 0 check (prs_count >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, billing_month)
);

create table if not exists public.stripe_webhook_events (
  id text primary key,
  type text not null,
  stripe_created_at timestamptz,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

create table if not exists public.gamification_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  coins integer not null default 0 check (coins >= 0),
  login_streak integer not null default 0 check (login_streak >= 0),
  last_login_at timestamptz,
  last_checkin_at timestamptz,
  active_title text not null default 'Iniciante Consistente',
  season_xp integer not null default 0 check (season_xp >= 0),
  season_level integer not null default 1 check (season_level >= 1),
  elite_pass_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gamification_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  source_id text,
  xp_delta integer not null default 0,
  coin_delta integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.gamification_cosmetics (
  user_id uuid not null references auth.users(id) on delete cascade,
  cosmetic_id text not null,
  unlocked_at timestamptz not null default now(),
  equipped boolean not null default false,
  primary key (user_id, cosmetic_id)
);

create table if not exists public.gamification_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_type text not null check (mission_type in ('daily', 'weekly', 'flash', 'boss', 'weekend')),
  metric text not null,
  title text not null,
  description text not null,
  target integer not null check (target > 0),
  progress integer not null default 0 check (progress >= 0),
  xp_reward integer not null default 0 check (xp_reward >= 0),
  coin_reward integer not null default 0 check (coin_reward >= 0),
  status text not null check (status in ('active', 'completed', 'claimed', 'expired')) default 'active',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_decision_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  used_ai boolean not null,
  used_deterministic_fallback boolean not null,
  deterministic_flags text[] not null default array[]::text[],
  validation_status text not null check (
    validation_status in ('valid', 'invalid_json', 'invalid_schema', 'no_json', 'error', 'blocked')
  ),
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_decision_audits_user_created_idx
  on public.ai_decision_audits (user_id, created_at desc);

create index if not exists ai_decision_audits_feature_created_idx
  on public.ai_decision_audits (feature, created_at desc);

alter table public.billing_subscriptions enable row level security;
alter table public.billing_usage_counters enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.gamification_profiles enable row level security;
alter table public.gamification_ledger enable row level security;
alter table public.gamification_cosmetics enable row level security;
alter table public.gamification_missions enable row level security;
alter table public.ai_decision_audits enable row level security;

drop policy if exists billing_subscriptions_select_own on public.billing_subscriptions;
create policy billing_subscriptions_select_own
  on public.billing_subscriptions
  for select
  using (auth.uid() = user_id);

drop policy if exists billing_usage_select_own on public.billing_usage_counters;
create policy billing_usage_select_own
  on public.billing_usage_counters
  for select
  using (auth.uid() = user_id);

drop policy if exists gamification_profiles_select_own on public.gamification_profiles;
create policy gamification_profiles_select_own
  on public.gamification_profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists gamification_ledger_select_own on public.gamification_ledger;
create policy gamification_ledger_select_own
  on public.gamification_ledger
  for select
  using (auth.uid() = user_id);

drop policy if exists gamification_cosmetics_select_own on public.gamification_cosmetics;
create policy gamification_cosmetics_select_own
  on public.gamification_cosmetics
  for select
  using (auth.uid() = user_id);

drop policy if exists gamification_missions_select_own on public.gamification_missions;
create policy gamification_missions_select_own
  on public.gamification_missions
  for select
  using (auth.uid() = user_id);

drop policy if exists ai_decision_audits_select_own on public.ai_decision_audits;
create policy ai_decision_audits_select_own
  on public.ai_decision_audits
  for select
  using (auth.uid() = user_id);

drop policy if exists ai_decision_audits_insert_own on public.ai_decision_audits;
create policy ai_decision_audits_insert_own
  on public.ai_decision_audits
  for insert
  with check (auth.uid() = user_id);

create or replace function public.increment_billing_usage(
  p_user_id uuid,
  p_billing_month text,
  p_field text,
  p_amount integer default 1
)
returns public.billing_usage_counters
language plpgsql
security definer
set search_path = public
as $$
declare
  next_row public.billing_usage_counters;
begin
  if p_field not in ('ai_requests', 'exports_count', 'prs_count') then
    raise exception 'Unsupported usage field: %', p_field;
  end if;

  insert into public.billing_usage_counters (user_id, billing_month)
  values (p_user_id, p_billing_month)
  on conflict (user_id, billing_month) do nothing;

  execute format(
    'update public.billing_usage_counters set %I = %I + $1, updated_at = now() where user_id = $2 and billing_month = $3 returning *',
    p_field,
    p_field
  )
  using p_amount, p_user_id, p_billing_month
  into next_row;

  return next_row;
end;
$$;

create or replace function public.apply_gamification_event(
  p_user_id uuid,
  p_event_type text,
  p_source_id text,
  p_xp_delta integer,
  p_coin_delta integer,
  p_metadata jsonb default '{}'::jsonb
)
returns public.gamification_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  next_profile public.gamification_profiles;
begin
  insert into public.gamification_profiles (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  insert into public.gamification_ledger (
    user_id,
    event_type,
    source_id,
    xp_delta,
    coin_delta,
    metadata
  )
  values (
    p_user_id,
    p_event_type,
    p_source_id,
    greatest(p_xp_delta, 0),
    p_coin_delta,
    coalesce(p_metadata, '{}'::jsonb)
  );

  update public.gamification_profiles
  set
    xp = xp + greatest(p_xp_delta, 0),
    season_xp = season_xp + greatest(p_xp_delta, 0),
    coins = greatest(coins + p_coin_delta, 0),
    level = greatest(1, floor(power((xp + greatest(p_xp_delta, 0)) / 100.0, 1 / 1.45))::integer + 1),
    season_level = greatest(1, floor((season_xp + greatest(p_xp_delta, 0)) / 300.0)::integer + 1),
    updated_at = now()
  where user_id = p_user_id
  returning * into next_profile;

  return next_profile;
end;
$$;

revoke execute on function public.increment_billing_usage(uuid, text, text, integer) from public, anon, authenticated;
revoke execute on function public.apply_gamification_event(uuid, text, text, integer, integer, jsonb) from public, anon, authenticated;
grant execute on function public.increment_billing_usage(uuid, text, text, integer) to service_role;
grant execute on function public.apply_gamification_event(uuid, text, text, integer, integer, jsonb) to service_role;

