# Bloco 07 - Comunidade & Social Real

## Status

Implementação integrada com Supabase Auth, Postgres, Realtime e RLS.

## Backend

- Migration principal: `supabase/migrations/20260511040000_social_real.sql`.
- Tabelas: `social_profiles`, `social_follows`, `social_posts`, `social_post_likes`, `social_post_comments`, `training_groups`, `training_group_members`, `training_group_messages`, `group_challenges`, `group_challenge_progress`, `coach_students`, `coach_private_notes`, `coach_workout_assignments`, `public_workout_templates`.
- RPCs:
  - `join_training_group_by_invite(p_invite_code text)` para entrar em grupo privado sem expor leitura ampla de grupos.
  - `get_group_leaderboard(p_group_id uuid, p_metric text)` para ranking semanal por volume, ranking por streak e treinos semanais.
- Trigger:
  - `workout_execution_social_profile_sync` atualiza estatísticas sociais quando uma sessão real de treino é persistida.

## Frontend

- Hub principal: `src/components/SocialHub.tsx`.
- Auth Supabase: `src/components/SupabaseAuthPanel.tsx` e `src/services/authService.ts`.
- Feed: `src/components/SocialFeed.tsx`.
- Grupos/chat/presença: `src/components/GroupHub.tsx`.
- Coach: `src/components/CoachConsole.tsx`.
- Perfil público/QR: `src/components/PublicProfileCard.tsx` e `src/components/PublicAthleteProfilePage.tsx`.
- Serviços: `src/services/socialService.ts`.
- Utils testados: `src/utils/socialUtils.ts`.

## Data mode

As features sociais não usam `localStorage` como persistência de produção. Se `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` não estiverem configurados, as ações sociais exibem erro de configuração e não simulam sucesso.

Não há `dataMode: "mock_dev_only"` nos fluxos de comunidade do Bloco 07.

## Rotas SPA

- `/u/:username`: perfil público carregado do Supabase.
- `/groups/join/:inviteCode`: abre o hub de comunidade e processa o convite após Auth/perfil social.
