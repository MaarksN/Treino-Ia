-- Follow-up advisor hardening for remaining low-risk findings.

create index if not exists student_messages_tenant_idx
  on public.student_messages (tenant_id);

create index if not exists student_messages_student_idx
  on public.student_messages (student_id);

create index if not exists student_messages_coach_idx
  on public.student_messages (coach_id);

create index if not exists telemetry_error_events_user_idx
  on public.telemetry_error_events (user_id);

create index if not exists tenant_students_student_idx
  on public.tenant_students (student_id);

create index if not exists tenant_students_coach_idx
  on public.tenant_students (coach_id);

create index if not exists training_group_messages_author_idx
  on public.training_group_messages (author_id);

create index if not exists training_groups_owner_idx
  on public.training_groups (owner_id);

-- Prefer moderation-aware policies from the moderation migration over simpler
-- drift-repair policies that create duplicate permissive SELECT paths.
drop policy if exists public_workout_templates_public_or_author_select on public.public_workout_templates;
drop policy if exists social_comments_visible_select on public.social_post_comments;
drop policy if exists social_posts_visible_select on public.social_posts;

-- Moderation resolution is for signed-in moderators only, never anon callers.
revoke execute on function public.resolve_social_report(uuid, text, text, text, text) from public, anon;
grant execute on function public.resolve_social_report(uuid, text, text, text, text) to authenticated, service_role;

-- Some projects have this helper from previous operational runs. Keep it
-- server-only when present without making clean database rebuilds fail.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
    grant execute on function public.rls_auto_enable() to service_role;
  end if;
end $$;

notify pgrst, 'reload schema';
