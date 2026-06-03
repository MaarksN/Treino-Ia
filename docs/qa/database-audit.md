# Auditoria de Banco de Dados

Status: PARTIAL

## Evidencias positivas

- 16 migrations SQL em `supabase/migrations`.
- `npm run schema:drift`: PASS, 1 arquivo e 2 testes.
- `tests/supabaseRlsCriticalTables.test.ts`: PASS dentro de `npm run test`; valida RLS de `user_periodization_plans`.
- Migrations contem RLS e policies `auth.uid() = user_id` ou `(select auth.uid()) = user_id` para varias tabelas.
- Indices por `user_id` e timestamps existem em migrations, por exemplo `billing_invoice_receipts`, `offline_sync_actions`, `workout_sessions`, `ai_recommendations`.

## Evidencias de escopo

- `supabase/migrations/20260511120000_platform_blocks_11_20_core.sql`: billing, audit logs, privacy, AI memory, offline sync, background jobs e RLS.
- `supabase/migrations/20260525000001_workout_relational_core.sql`: workout sessions, exercise logs, PRs, AI recommendations e RLS.
- `supabase/migrations/20260526044951_sprint3_core_rls_initplan_hardening.sql`: hardening de policies usando `(select auth.uid())`.

## Bloqueios

- `supabase migration list` nao foi executado contra projeto remoto porque nao ha `SUPABASE_ACCESS_TOKEN`/`SUPABASE_DB_URL`.
- Migrations nao foram aplicadas em banco limpo durante esta auditoria.
- Seeds, rollback, backup e restore nao foram executados.
- Multi-tenant real Tenant A/Tenant B nao foi testado.

## Riscos

- A camada B2C usa principalmente `user_id`; nao ha prova dinamica de isolamento entre usuarios no banco real.
- Algumas operacoes usam service role em Functions; isso exige testes negativos de IDOR e tenant scope no ambiente real.
- `mock_dev_only` e `local_fallback` podem mascarar ausencia de persistencia real se ambiente estiver mal configurado.

## Decisao de banco

PARTIAL. Schema e RLS tem boa evidencia estatica e testes locais, mas os gates G7/G13/G17 nao passam sem aplicar migrations e testar isolamento/backup/restore no Supabase alvo.
