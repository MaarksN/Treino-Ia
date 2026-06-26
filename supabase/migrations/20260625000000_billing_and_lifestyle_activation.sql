-- MIGRATION: Activation of Billing, Nutrition and Lifestyle

-- 1. Subscriptions table
create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'free',
  plan_type text not null default 'free',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;
create policy "Users can view own subscription" on public.user_subscriptions
  for select using (auth.uid() = user_id);

-- 2. Ensure nutrition and sleep tables have RLS (redundant if already in sprint 3 but safe)
alter table if exists public.nutrition_macro_targets enable row level security;
alter table if exists public.nutrition_meal_entries enable row level security;
alter table if exists public.sleep_entries enable row level security;

-- 3. Grant permissions
grant select on public.user_subscriptions to authenticated;
grant select, insert, update, delete on public.nutrition_macro_targets to authenticated;
grant select, insert, update, delete on public.nutrition_meal_entries to authenticated;
grant select, insert, update, delete on public.sleep_entries to authenticated;
