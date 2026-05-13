create extension if not exists pgcrypto;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null check (channel in ('push', 'email', 'whatsapp', 'in_app', 'webhook')),
  source_table text not null,
  source_id uuid,
  subject text not null,
  body text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped')),
  provider text,
  provider_response jsonb not null default '{}'::jsonb,
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  failed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_oauth_states (
  state text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google_fit', 'fitbit', 'strava')),
  redirect_to text,
  code_verifier text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.health_integration_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google_fit', 'fitbit', 'strava')),
  access_token text not null,
  refresh_token text,
  token_type text,
  scope text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, provider)
);

create table if not exists public.health_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (
    provider in ('apple_health', 'google_fit', 'health_connect', 'garmin', 'fitbit', 'ble_hr', 'strava')
  ),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'skipped')),
  requested_by text not null default 'user',
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notification_deliveries_user_created_idx
  on public.notification_deliveries (user_id, created_at desc);

create index if not exists notification_deliveries_status_schedule_idx
  on public.notification_deliveries (status, scheduled_for asc);

create index if not exists health_oauth_states_user_provider_idx
  on public.health_oauth_states (user_id, provider, expires_at desc);

create index if not exists health_sync_jobs_user_created_idx
  on public.health_sync_jobs (user_id, created_at desc);

alter table public.notification_deliveries enable row level security;
alter table public.health_oauth_states enable row level security;
alter table public.health_integration_tokens enable row level security;
alter table public.health_sync_jobs enable row level security;

drop policy if exists notification_deliveries_own_select on public.notification_deliveries;
create policy notification_deliveries_own_select
  on public.notification_deliveries
  for select
  using (auth.uid() = user_id);

drop policy if exists health_sync_jobs_own_select on public.health_sync_jobs;
create policy health_sync_jobs_own_select
  on public.health_sync_jobs
  for select
  using (auth.uid() = user_id);

drop policy if exists health_sync_jobs_own_insert on public.health_sync_jobs;
create policy health_sync_jobs_own_insert
  on public.health_sync_jobs
  for insert
  with check (auth.uid() = user_id);

-- OAuth states and provider tokens are deliberately service-role only.
-- Do not add authenticated select policies; tokens must never be exposed to clients.
