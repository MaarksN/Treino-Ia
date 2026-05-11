# Bloco 07 - Comunidade & Social Real

## Status

Implementação integrada com Supabase Auth, Postgres, Realtime e RLS.

## Backend

- Migration principal: `supabase/migrations/20260511040000_social_real.sql`.
- Migration de moderação: `supabase/migrations/20260511051000_social_moderation_reports.sql`.
- Tabelas: `social_profiles`, `social_follows`, `social_posts`, `social_post_likes`, `social_post_comments`, `training_groups`, `training_group_members`, `training_group_messages`, `group_challenges`, `group_challenge_progress`, `coach_students`, `coach_private_notes`, `coach_workout_assignments`, `public_workout_templates`.
- RPCs:
  - `join_training_group_by_invite(p_invite_code text)` para entrar em grupo privado sem expor leitura ampla de grupos.
  - `get_group_leaderboard(p_group_id uuid, p_metric text)` para ranking semanal por volume, ranking por streak e treinos semanais.
- Trigger:
  - `workout_execution_social_profile_sync` atualiza estatísticas sociais quando uma sessão real de treino é persistida.
  - `social_report_threshold` marca conteúdo como `under_review` na primeira denúncia e como `hidden` após 3 denúncias distintas para post/comentário/template ou 5 denúncias distintas para perfil.

## Moderação e Denúncia

- Tabelas: `social_content_reports` e `social_moderators`.
- Conteúdos moderáveis: posts, comentários, perfis públicos e templates públicos.
- Status de conteúdo: `visible`, `under_review`, `hidden`, `removed`.
- Motivos aceitos: spam, assédio, ódio/discriminação, conteúdo sexual, violência, autoagressão, atividade ilegal, privacidade/dados pessoais, informação falsa perigosa e outro.
- Usuários autenticados podem denunciar uma vez por alvo.
- Moderadores são usuários cadastrados em `social_moderators`; a resolução operacional é feita pela RPC `resolve_social_report(...)`.
- Regras de visibilidade via RLS: conteúdo `hidden` ou `removed` sai das listas públicas; autor e moderadores ainda conseguem consultar para auditoria.
- Operação recomendada: cadastrar moderadores com service role, revisar denúncias abertas, registrar `moderation_action`, e manter justificativa em `moderation_reason`.

## Frontend

- Hub principal: `src/components/SocialHub.tsx`.
- Auth Supabase: `src/components/SupabaseAuthPanel.tsx` e `src/services/authService.ts`.
- Feed: `src/components/SocialFeed.tsx`.
- Denúncia: `src/components/SocialReportButton.tsx`.
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
