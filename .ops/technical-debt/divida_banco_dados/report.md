# Auditoria de Divida Tecnica - Banco de Dados

## 1. Resumo executivo

- **Veredito:** FAIL
- **Severidade dominante:** CRITICA
- **Fato confirmado:** existem migrations com RLS para treinamento, billing, social, gamificacao, OAuth tokens e alguns jobs.
- **Risco principal:** o app referencia varias tabelas que nao aparecem nas migrations do repositorio, e ha schemas duplicados/conflitantes de billing/gamificacao. Isso torna o estado real do banco dificil de reproduzir e auditar.

## 2. Escopo analisado

- `supabase/migrations/*`
- `supabase/social-schema.sql`
- `supabase/billing-gamification-schema.sql`
- Chamadas Supabase em `src/services/healthService.ts`, `src/services/retentionService.ts`, `src/services/socialService.ts`, `api/*`.

## 3. Comandos executados

- `rg -n "create table|enable row level security|create policy|create index|foreign key|references|unique|primary key" supabase`
- `rg -n "retention_profiles|habit_reminders|automated_checkins|health_integrations|white_label_tenants|tenant_students|student_assessments|student_messages" supabase src api`
- `rg -n "nutrition_macro_targets|nutrition_meal_entries|hydration_entries|sleep_entries|recovery_daily_checkins" supabase src/services/healthService.ts`

## 4. Achados por severidade

### CRITICA

**DB-01 - Tabelas usadas por saude, nutricao e retencao nao existem nas migrations**

- Evidencia: `src/services/healthService.ts:228`, `:268`, `:314`, `:516`, `:673`, `:771` usa `recovery_daily_checkins`, `health_injury_records`, `nutrition_*`, `hydration_*`, `sleep_entries`.
- Evidencia: `src/services/retentionService.ts:257-268` usa `retention_profiles`, `user_streaks`, `habit_events`, `habit_reminders`, `consistency_challenges`, `retention_badges`, `automated_checkins`, `alternative_workouts`, `workout_calendar_items`, `health_integrations`, `white_label_tenants`.
- Evidencia: `rg` em `supabase` nao encontrou `create table` para essas tabelas.
- Impacto: producao pode falhar em runtime assim que usuario autenticado acessar esses fluxos; RLS e constraints inexistentes no repo.
- Recomendacao: criar migrations idempotentes para todas as tabelas referenciadas ou remover superficies ate o schema existir.

**DB-02 - Schemas de billing/gamificacao duplicados e divergentes**

- Evidencia: `supabase/migrations/20260511120000_platform_blocks_11_20_core.sql:7-64` define billing.
- Evidencia: `supabase/billing-gamification-schema.sql:6-37` tambem define billing com constraints diferentes.
- Evidencia: `supabase/migrations/20260512000000_gamification.sql:5-112` define gamificacao, enquanto `supabase/billing-gamification-schema.sql:39-117` define outra versao.
- Impacto: ambientes podem divergir dependendo se o SQL solto foi aplicado manualmente.
- Recomendacao: promover um unico caminho de migrations versionadas e marcar SQL solto como legado/referencia.

**DB-03 - RPCs `security definer` sem hardening consistente**

- Evidencia: `supabase/migrations/20260512000000_gamification.sql:115-226` cria RPCs sem `set search_path` e sem `revoke execute`.
- Evidencia positiva divergente: `supabase/billing-gamification-schema.sql:253-256` revoga e concede RPCs a `service_role`, mas esse arquivo nao esta em `supabase/migrations`.
- Impacto: risco de execucao indevida e comportamento diferente entre ambientes.
- Recomendacao: adicionar migration oficial de hardening.

### ALTA

**DB-04 - Policies sociais amplas continuam ativas se `social-schema.sql` foi aplicado**

- Evidencia: `supabase/social-schema.sql:178-179` policy `"comments read"` usa `true`.
- Evidencia: `supabase/social-schema.sql:199-200` policy `"group members read"` usa `true`.
- Evidencia: migration posterior nao dropa esses nomes.
- Impacto: RLS final pode ser mais permissivo que a migration de moderacao sugere.
- Recomendacao: dropar explicitamente policies legadas amplas.

**DB-05 - Modelo principal e `user_id`-only, sem `tenant_id` e indices por tenant**

- Evidencia: tabelas centrais em `supabase/migrations/20260511120000_platform_blocks_11_20_core.sql:7-174` e `20260511052000_legacy_training_profile_plan_history.sql:3-51` usam `user_id`.
- Impacto: falta base para isolamento, consultas e billing por organizacao.
- Recomendacao: modelar tenant/workspace e migrar chaves/indices.

### MEDIA

**DB-06 - Uso pesado de JSONB para dados centrais de treino**

- Evidencia: `supabase/migrations/20260511052000_legacy_training_profile_plan_history.sql:5`, `:19`, `:35` usa `profile_json`, `plan_json`, `record_json`.
- Impacto: facilita MVP, mas dificulta queries analiticas, constraints de dominio e migracoes parciais.
- Recomendacao: manter JSONB apenas como snapshot e criar tabelas normalizadas para sessoes, exercicios e series.

**DB-07 - Grants anon para tabelas protegidas por RLS confundem auditoria**

- Evidencia: `supabase/migrations/20260511052000_legacy_training_profile_plan_history.sql:156-166` concede `select` a `anon` em tabelas de treino, dependendo de RLS para bloquear.
- Impacto: nao e necessariamente exploravel por causa da RLS, mas aumenta a superficie e exige testes fortes.
- Recomendacao: reduzir grants anon onde nao ha necessidade publica.

## 5. Evidencias positivas

- Migrations de treino possuem PK composta por `user_id,id` e indices por usuario/data.
- Billing e jobs usam RLS por `user_id`.
- `health_integration_tokens` e `health_oauth_states` nao tem policies de select para cliente, boa escolha para tokens.

## 6. Riscos para SaaS real

- Ambientes nao reproduziveis.
- Runtime failures em fluxos de saude/nutricao/retencao.
- RLS efetiva diferente do esperado.
- Ausencia de isolamento por tenant.

## 7. Recomendacoes priorizadas

1. Gerar inventario tabela-a-tabela comparando codigo vs migrations.
2. Criar migrations para tabelas usadas e ausentes.
3. Consolidar billing/gamificacao em migrations oficiais.
4. Hardening de RPCs e policies sociais.
5. Planejar normalizacao de dados de treino.

## 8. Quick wins

- Adicionar teste que varre `.from('table')` e confere `create table` nas migrations.
- Mover `billing-gamification-schema.sql` para docs/legacy ou convertelo em migration idempotente.
- Criar migration de drop das policies amplas.

## 9. Itens que exigem decisao humana

- Quais features devem existir agora versus ficar como preview.
- Se o produto precisa multi-tenancy B2B no curto prazo.
- Politica de normalizacao de dados historicos.

## 10. Veredito final

**FAIL.** O banco tem boas ilhas de RLS, mas o schema versionado nao cobre o produto que o frontend/API ja tentam operar.
