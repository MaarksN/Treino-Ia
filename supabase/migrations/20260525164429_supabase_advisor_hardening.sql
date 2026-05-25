-- Advisor hardening after release stabilization.
-- Keeps server-only data inaccessible to browser roles while clearing noisy
-- Supabase lints for missing policies, duplicate policies, and unindexed FKs.

create index if not exists account_deletion_requests_user_idx
  on public.account_deletion_requests (user_id);

create index if not exists privacy_export_requests_user_idx
  on public.privacy_export_requests (user_id);

create index if not exists billing_referrals_referred_user_idx
  on public.billing_referrals (referred_user_id);

create index if not exists set_logs_user_idx
  on public.set_logs (user_id);

create index if not exists personal_records_source_session_idx
  on public.personal_records (source_session_id);

create index if not exists personal_records_source_set_log_idx
  on public.personal_records (source_set_log_id);

create index if not exists ai_recommendations_source_session_idx
  on public.ai_recommendations (source_session_id);

create index if not exists ai_recommendations_decided_by_idx
  on public.ai_recommendations (decided_by);

create index if not exists plan_revisions_source_recommendation_idx
  on public.plan_revisions (source_recommendation_id);

create index if not exists coach_students_student_idx
  on public.coach_students (student_id);

create index if not exists coach_private_notes_coach_idx
  on public.coach_private_notes (coach_id);

create index if not exists coach_private_notes_student_idx
  on public.coach_private_notes (student_id);

create index if not exists coach_workout_assignments_coach_idx
  on public.coach_workout_assignments (coach_id);

create index if not exists coach_workout_assignments_student_idx
  on public.coach_workout_assignments (student_id);

create index if not exists social_follows_following_idx
  on public.social_follows (following_id);

create index if not exists social_post_likes_user_idx
  on public.social_post_likes (user_id);

create index if not exists social_post_comments_post_idx
  on public.social_post_comments (post_id);

create index if not exists social_post_comments_author_idx
  on public.social_post_comments (author_id);

create index if not exists social_post_comments_moderated_by_idx
  on public.social_post_comments (moderated_by);

create index if not exists social_posts_moderated_by_idx
  on public.social_posts (moderated_by);

create index if not exists social_profiles_moderated_by_idx
  on public.social_profiles (moderated_by);

create index if not exists public_workout_templates_author_idx
  on public.public_workout_templates (author_id);

create index if not exists public_workout_templates_moderated_by_idx
  on public.public_workout_templates (moderated_by);

create index if not exists consistency_challenges_user_idx
  on public.consistency_challenges (user_id);

create index if not exists gamification_clan_members_user_idx
  on public.gamification_clan_members (user_id);

create index if not exists student_assessments_tenant_idx
  on public.student_assessments (tenant_id);

create index if not exists student_assessments_student_idx
  on public.student_assessments (student_id);

create index if not exists student_assessments_coach_idx
  on public.student_assessments (coach_id);

-- These tables are written/read by trusted API code. Browser users should not
-- receive policies for token, webhook, or raw telemetry rows.
drop policy if exists health_oauth_states_service_role_all on public.health_oauth_states;
create policy health_oauth_states_service_role_all
  on public.health_oauth_states
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists health_integration_tokens_service_role_all on public.health_integration_tokens;
create policy health_integration_tokens_service_role_all
  on public.health_integration_tokens
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists stripe_webhook_events_service_role_all on public.stripe_webhook_events;
create policy stripe_webhook_events_service_role_all
  on public.stripe_webhook_events
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists telemetry_error_events_service_role_all on public.telemetry_error_events;
create policy telemetry_error_events_service_role_all
  on public.telemetry_error_events
  for all
  to service_role
  using (true)
  with check (true);

-- Keep the richer moderation-aware social profile policies and remove the
-- simpler drift-repair duplicates.
drop policy if exists social_profiles_public_or_self_select on public.social_profiles;
drop policy if exists social_profiles_self_update on public.social_profiles;

-- Remove legacy human-named periodization policies that duplicate the stable
-- machine-named policies created by later migrations.
drop policy if exists "Users can view their own periodization plans" on public.user_periodization_plans;
drop policy if exists "Users can insert their own periodization plans" on public.user_periodization_plans;
drop policy if exists "Users can update their own periodization plans" on public.user_periodization_plans;
drop policy if exists "Users can delete their own periodization plans" on public.user_periodization_plans;

-- Trigger/server-only functions should not be directly callable from exposed
-- API roles. Authenticated product RPCs remain granted in their own migrations.
alter function public.set_updated_at() set search_path = public;

revoke execute on function public.apply_social_report_threshold() from public, anon, authenticated;
grant execute on function public.apply_social_report_threshold() to service_role;

revoke execute on function public.increment_billing_usage(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.increment_billing_usage(uuid, text, text, integer) to service_role;

notify pgrst, 'reload schema';
