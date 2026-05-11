-- Core production tables for blocks 11-20.
-- These tables back billing, privacy, accessibility preferences, AI memory,
-- public integration auditability, and education progress with per-user RLS.

create extension if not exists pgcrypto;

create table if not exists public.billing_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null default 'free' check (plan_id in ('free', 'pro', 'coach', 'elite')),
  status text not null default 'free',
  interval text not null default 'month' check (interval in ('month', 'year')),
  stripe_customer_id text,
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
  ai_requests integer not null default 0,
  exports_count integer not null default 0,
  prs_count integer not null default 0,
  best_streak integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, billing_month)
);

create table if not exists public.billing_invoice_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_invoice_id text unique,
  amount_paid integer not null default 0,
  currency text not null default 'brl',
  hosted_invoice_url text,
  receipt_url text,
  status text not null default 'open',
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.billing_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid references auth.users(id) on delete set null,
  referral_code text not null,
  reward_months integer not null default 1,
  status text not null default 'pending' check (status in ('pending', 'qualified', 'rewarded', 'expired')),
  qualified_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  id text primary key,
  type text not null,
  stripe_created_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now()
);

create table if not exists public.platform_user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'pt-BR' check (locale in ('pt-BR', 'en-US', 'es')),
  font_scale text not null default 'm' check (font_scale in ('s', 'm', 'l', 'xl')),
  high_contrast boolean not null default false,
  colorblind_mode text not null default 'none' check (colorblind_mode in ('none', 'deuteranopia', 'protanopia')),
  simplified_mode boolean not null default false,
  reduced_motion boolean not null default false,
  physical_limitation text,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.privacy_export_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'processing', 'ready', 'failed')),
  download_url text,
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'cancelled')),
  retention_until timestamptz not null default (now() + interval '7 days'),
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_long_term_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_type text not null default 'coach_note',
  content text not null,
  source text not null default 'user',
  confidence numeric(4, 3) not null default 0.8 check (confidence >= 0 and confidence <= 1),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '6 months')
);

create table if not exists public.education_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id text not null,
  content_type text not null check (content_type in ('exercise', 'article', 'course', 'quiz', 'program')),
  status text not null default 'started' check (status in ('started', 'completed', 'archived')),
  xp_awarded integer not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, content_id, content_type)
);

create table if not exists public.outbound_webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_url text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'delivered', 'failed')),
  response_status integer,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.offline_sync_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_action_id text not null,
  action_type text not null,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (user_id, client_action_id)
);

create table if not exists public.telemetry_error_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  source text not null,
  message text not null,
  stack text,
  url text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists billing_invoice_receipts_user_issued_idx
  on public.billing_invoice_receipts (user_id, issued_at desc);

create index if not exists billing_referrals_referrer_idx
  on public.billing_referrals (referrer_user_id, created_at desc);

create index if not exists user_audit_logs_user_created_idx
  on public.user_audit_logs (user_id, created_at desc);

create index if not exists ai_long_term_memory_user_expires_idx
  on public.ai_long_term_memory (user_id, expires_at desc);

create index if not exists outbound_webhook_deliveries_user_created_idx
  on public.outbound_webhook_deliveries (user_id, created_at desc);

create index if not exists offline_sync_actions_user_received_idx
  on public.offline_sync_actions (user_id, received_at desc);

create index if not exists telemetry_error_events_created_idx
  on public.telemetry_error_events (created_at desc);

create or replace function public.increment_billing_usage(
  p_user_id uuid,
  p_billing_month text,
  p_field text,
  p_amount integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.billing_usage_counters%rowtype;
begin
  if p_field not in ('ai_requests', 'exports_count', 'prs_count') then
    raise exception 'Unsupported billing usage field: %', p_field;
  end if;

  insert into public.billing_usage_counters (user_id, billing_month)
  values (p_user_id, p_billing_month)
  on conflict (user_id, billing_month) do nothing;

  update public.billing_usage_counters
  set
    ai_requests = ai_requests + case when p_field = 'ai_requests' then p_amount else 0 end,
    exports_count = exports_count + case when p_field = 'exports_count' then p_amount else 0 end,
    prs_count = prs_count + case when p_field = 'prs_count' then p_amount else 0 end,
    updated_at = now()
  where user_id = p_user_id
    and billing_month = p_billing_month
  returning * into updated_row;

  return to_jsonb(updated_row);
end;
$$;

grant execute on function public.increment_billing_usage(uuid, text, text, integer)
  to authenticated, service_role;

alter table public.billing_subscriptions enable row level security;
alter table public.billing_usage_counters enable row level security;
alter table public.billing_invoice_receipts enable row level security;
alter table public.billing_referrals enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.platform_user_preferences enable row level security;
alter table public.user_audit_logs enable row level security;
alter table public.privacy_export_requests enable row level security;
alter table public.account_deletion_requests enable row level security;
alter table public.ai_long_term_memory enable row level security;
alter table public.education_progress enable row level security;
alter table public.outbound_webhook_deliveries enable row level security;
alter table public.offline_sync_actions enable row level security;
alter table public.telemetry_error_events enable row level security;

drop policy if exists billing_subscriptions_own_select on public.billing_subscriptions;
create policy billing_subscriptions_own_select
  on public.billing_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists billing_usage_counters_own_select on public.billing_usage_counters;
create policy billing_usage_counters_own_select
  on public.billing_usage_counters for select
  using (auth.uid() = user_id);

drop policy if exists billing_invoice_receipts_own_select on public.billing_invoice_receipts;
create policy billing_invoice_receipts_own_select
  on public.billing_invoice_receipts for select
  using (auth.uid() = user_id);

drop policy if exists billing_referrals_own_all on public.billing_referrals;
create policy billing_referrals_own_all
  on public.billing_referrals for all
  using (auth.uid() = referrer_user_id)
  with check (auth.uid() = referrer_user_id);

drop policy if exists platform_user_preferences_own_all on public.platform_user_preferences;
create policy platform_user_preferences_own_all
  on public.platform_user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_audit_logs_own_select_insert on public.user_audit_logs;
create policy user_audit_logs_own_select_insert
  on public.user_audit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists privacy_export_requests_own_all on public.privacy_export_requests;
create policy privacy_export_requests_own_all
  on public.privacy_export_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists account_deletion_requests_own_all on public.account_deletion_requests;
create policy account_deletion_requests_own_all
  on public.account_deletion_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists ai_long_term_memory_own_all on public.ai_long_term_memory;
create policy ai_long_term_memory_own_all
  on public.ai_long_term_memory for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists education_progress_own_all on public.education_progress;
create policy education_progress_own_all
  on public.education_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists outbound_webhook_deliveries_own_all on public.outbound_webhook_deliveries;
create policy outbound_webhook_deliveries_own_all
  on public.outbound_webhook_deliveries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists offline_sync_actions_own_all on public.offline_sync_actions;
create policy offline_sync_actions_own_all
  on public.offline_sync_actions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
