# Runbook de Rollback de Migrations

## Politica

Migrations aplicadas em ambientes compartilhados nao devem ser editadas. Qualquer correcao deve entrar como nova migration incremental em `supabase/migrations`.

## Checklist para novas migrations

1. Declarar objetivo, tabelas/RPCs afetadas e risco de dados.
2. Incluir caminho de rollback no PR: nova migration reversa, comando SQL manual ou justificativa quando a mudanca for irreversivel.
3. Para tabelas com `user_id`, habilitar RLS e policy `auth.uid() = user_id` na mesma migration.
4. Para RPCs sensiveis, testar permissao, usuario e idempotencia.
5. Rodar `npm run schema:drift` e registrar o resultado no PR.

## Rollback operacional

1. Congelar deploys e identificar a migration pelo timestamp.
2. Criar uma migration nova que reverta a mudanca com menor impacto possivel.
3. Se houver perda ou transformacao de dados, restaurar a partir de backup Supabase antes de reabrir escrita.
4. Validar RLS, rotas de API impactadas e fluxo de login/treino/billing.
5. Registrar follow-up em ADR ou runbook quando o incidente mudar uma decisao tecnica.
