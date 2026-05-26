-- Sprint 3 production validation hardening.
-- Keep the same owner-only RLS semantics, but avoid re-evaluating auth.uid()
-- per row on the core beta tables flagged by Supabase advisors.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'workout_sessions',
    'exercise_logs',
    'set_logs',
    'personal_records',
    'ai_recommendations',
    'plan_revisions'
  ] loop
    execute format('drop policy if exists %I on public.%I', table_name || '_own_select', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_own_insert', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_own_update', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_own_delete', table_name);
    execute format('create policy %I on public.%I for select using ((select auth.uid()) = user_id)', table_name || '_own_select', table_name);
    execute format('create policy %I on public.%I for insert with check ((select auth.uid()) = user_id)', table_name || '_own_insert', table_name);
    execute format('create policy %I on public.%I for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name || '_own_update', table_name);
    execute format('create policy %I on public.%I for delete using ((select auth.uid()) = user_id)', table_name || '_own_delete', table_name);
  end loop;
end $$;

drop policy if exists training_user_profiles_own_select on public.training_user_profiles;
create policy training_user_profiles_own_select
  on public.training_user_profiles for select
  using ((select auth.uid()) = user_id);

drop policy if exists training_user_profiles_own_insert on public.training_user_profiles;
create policy training_user_profiles_own_insert
  on public.training_user_profiles for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists training_user_profiles_own_update on public.training_user_profiles;
create policy training_user_profiles_own_update
  on public.training_user_profiles for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists training_workout_plans_own_select on public.training_workout_plans;
create policy training_workout_plans_own_select
  on public.training_workout_plans for select
  using ((select auth.uid()) = user_id);

drop policy if exists training_workout_plans_own_insert on public.training_workout_plans;
create policy training_workout_plans_own_insert
  on public.training_workout_plans for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists training_workout_plans_own_update on public.training_workout_plans;
create policy training_workout_plans_own_update
  on public.training_workout_plans for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists training_workout_plans_own_delete on public.training_workout_plans;
create policy training_workout_plans_own_delete
  on public.training_workout_plans for delete
  using ((select auth.uid()) = user_id);

drop policy if exists training_workout_history_own_select on public.training_workout_history_records;
create policy training_workout_history_own_select
  on public.training_workout_history_records for select
  using ((select auth.uid()) = user_id);

drop policy if exists training_workout_history_own_insert on public.training_workout_history_records;
create policy training_workout_history_own_insert
  on public.training_workout_history_records for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists training_workout_history_own_update on public.training_workout_history_records;
create policy training_workout_history_own_update
  on public.training_workout_history_records for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists user_periodization_plans_select_own on public.user_periodization_plans;
create policy user_periodization_plans_select_own
  on public.user_periodization_plans for select
  using ((select auth.uid()) = user_id);

drop policy if exists user_periodization_plans_insert_own on public.user_periodization_plans;
create policy user_periodization_plans_insert_own
  on public.user_periodization_plans for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists user_periodization_plans_update_own on public.user_periodization_plans;
create policy user_periodization_plans_update_own
  on public.user_periodization_plans for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists user_periodization_plans_delete_own on public.user_periodization_plans;
create policy user_periodization_plans_delete_own
  on public.user_periodization_plans for delete
  using ((select auth.uid()) = user_id);

drop policy if exists billing_subscriptions_own_select on public.billing_subscriptions;
create policy billing_subscriptions_own_select
  on public.billing_subscriptions for select
  using ((select auth.uid()) = user_id);

drop policy if exists billing_usage_counters_own_select on public.billing_usage_counters;
create policy billing_usage_counters_own_select
  on public.billing_usage_counters for select
  using ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
