-- Sprint 3 beta lockdown for advanced social/moderation RPCs.
-- Social, groups and moderation are internal surfaces for private beta.
-- Keep functions available to service-role jobs, but remove direct REST/RPC access
-- from anon/authenticated clients until these flows get a dedicated hardening pass.

revoke execute on function public.is_social_moderator(uuid) from public, anon, authenticated;
grant execute on function public.is_social_moderator(uuid) to service_role;

revoke execute on function public.is_training_group_member(uuid, uuid) from public, anon, authenticated;
grant execute on function public.is_training_group_member(uuid, uuid) to service_role;

revoke execute on function public.join_training_group_by_invite(text) from public, anon, authenticated;
grant execute on function public.join_training_group_by_invite(text) to service_role;

revoke execute on function public.get_group_leaderboard(uuid, text) from public, anon, authenticated;
grant execute on function public.get_group_leaderboard(uuid, text) to service_role;

revoke execute on function public.resolve_social_report(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.resolve_social_report(uuid, text, text, text, text) to service_role;

notify pgrst, 'reload schema';
