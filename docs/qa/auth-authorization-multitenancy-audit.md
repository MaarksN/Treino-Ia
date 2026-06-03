# Auditoria de Auth, Autorizacao e Multi-Tenancy

Status: BLOCKED/PARTIAL

## Evidencias positivas

- Supabase client so e configurado se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` existirem: `src/services/supabaseClient.ts:17`.
- APIs server-side usam `requireSupabaseUser(request)` antes de operacoes sensiveis.
- RLS em migrations usa `auth.uid() = user_id` em varias tabelas.
- `tests/supabaseRlsCriticalTables.test.ts` valida RLS de tabela critica.
- `tests/authErrorStandardization.test.ts` valida 401 sem auth em endpoints criticos.
- `tests/localStorageCriticalIsolation.test.ts` cobre isolamento local critico.

## Bloqueios

- Nao havia credenciais reais para criar Usuario/Tenant A e Usuario/Tenant B.
- Nao foi possivel executar leitura/edicao/exclusao cruzada no Supabase real.
- Nao foi possivel validar token expirado, token invalido real, usuario suspenso/removido ou RBAC de roles em staging.
- `preflight:sprint3` falhou por falta de envs reais.

## Riscos

- A aplicacao usa modelo B2C por `user_id`, nao uma modelagem multi-tenant formal por `tenantId`, exceto areas educacionais/coach com `tenant_id` em migrations.
- Service role no backend exige disciplina de sempre escopar por usuario autenticado; isso foi encontrado em muitos pontos, mas nao provado dinamicamente.
- Fallbacks `local_fallback` e `mock_dev_only` podem esconder ausencia de auth real.

## Decisao

BLOCKED para G11/G12/G13 em producao. Sem P0 confirmado, mas o gate de isolamento multi-tenant nao pode ser considerado PASS.
