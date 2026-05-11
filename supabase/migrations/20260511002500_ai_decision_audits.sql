-- Persist AI personalization decision audits with per-user RLS.

create extension if not exists pgcrypto;

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

alter table public.ai_decision_audits enable row level security;

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
