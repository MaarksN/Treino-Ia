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
