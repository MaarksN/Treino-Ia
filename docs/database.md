# TREINO-IA — Database Baseline

## Banco principal

- **Supabase Postgres**.
- Migrations SQL versionadas em `supabase/migrations`.
- Tabelas sensíveis com **RLS habilitada**.

## Regras obrigatórias de modelagem

- `user_id` referencia `auth.users(id)` quando aplicável.
- Policies padrão por owner: `auth.uid() = user_id`.
- Entitlement, billing status, XP/coins/streak e treino persistidos no servidor.
- Sem dependência de localStorage para estado crítico.

## Domínios já previstos em migrations

- Perfis/core
- Billing/Stripe
- Gamificação
- Treino/execução
- IA/auditoria de decisão
- Periodização
- Social
- Nutrição
- Recovery
- Integrações

## Rollback de migrations

O processo operacional fica em `docs/database-migration-rollback.md`. Novas migrations devem declarar como reverter, ou justificar explicitamente quando a operacao for irreversivel.
