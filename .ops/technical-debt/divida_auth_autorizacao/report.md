# Auditoria de Divida Tecnica - Autenticacao e Autorizacao

## 1. Resumo executivo

- **Veredito:** FAIL
- **Severidade dominante:** CRITICA / ALTA
- **Fato confirmado:** as APIs server-side validam Bearer token Supabase com `requireSupabaseUser`.
- **Risco principal:** o modelo de autorizacao e quase todo baseado em `user_id`; nao ha escopo organizacional global, RBAC/ABAC centralizado ou middleware de permissao. Algumas regras de dominio criticas dependem de chamadas feitas pelo client e de RLS fragmentada.

## 2. Escopo analisado

- Auth/API: `api/_lib/server-supabase.ts`, endpoints em `api/*`.
- Billing/entitlements: `api/_lib/billing-entitlements.ts`, `src/services/billingService.ts`.
- Social/coach: `src/services/socialService.ts`, `supabase/social-schema.sql`, `supabase/migrations/20260511051000_social_moderation_reports.sql`.
- Gamificacao: `api/gamification/event.ts`, `supabase/migrations/20260512000000_gamification.sql`.
- Multi-tenant/white-label: `src/services/retentionService.ts`, `src/types/retention.ts`.

## 3. Comandos executados

- `rg -n "role|permission|premium|entitlement|admin|auth.uid|enable row level security|policy|rls|jwt|session|user_id|actorId|actor_id" src api supabase tests docs`
- `rg -n "tenant|tenant_id|workspace|organization_id" src api supabase docs`
- leituras de `server-supabase.ts`, `gamification/event.ts`, `socialService.ts`, `social-schema.sql`, migrations sociais e billing.

## 4. Achados por severidade

### CRITICA

**AUTH-01 - Nao ha escopo organizacional global para SaaS B2B**

- Evidencia: `api/_lib/server-supabase.ts:30-40` autentica usuario e retorna apenas `User`.
- Evidencia: principais tabelas usam `user_id` como owner; `supabase/migrations/20260511120000_platform_blocks_11_20_core.sql:7-174`.
- Evidencia: referencias a tenant existem em `src/services/retentionService.ts:268-293`, mas nao ha migrations correspondentes para `white_label_tenants`, `tenant_students`, `student_assessments` e `student_messages`.
- Impacto: impossibilita RBAC por empresa/workspace, billing por organizacao e isolamento cross-tenant consistente.
- Recomendacao: criar modelo `workspaces`, `workspace_members`, roles, tenant-aware RLS e middleware `requireWorkspaceRole`.

### ALTA

**AUTH-02 - Eventos de gamificacao aceitam provas controladas pelo client**

- Evidencia: `api/gamification/event.ts:60-66` aceita `eventType` do body.
- Evidencia: `api/gamification/event.ts:148-164` concede recompensas de eventos como `workout_completed` usando `sourceId` informado pelo cliente.
- Impacto: um usuario autenticado pode simular eventos com novos `sourceId` e ganhar XP/moedas sem prova de treino real.
- Recomendacao: derivar eventos a partir de registros server-side de treino/check-in ou jobs idempotentes, nao de comando direto do cliente.

**AUTH-03 - Relacao coach/aluno pode ser criada ativa sem consentimento do aluno**

- Evidencia: `src/services/socialService.ts:617-630` permite `addCoachStudentByUsername` e grava `status: 'active'`.
- Evidencia: `supabase/social-schema.sql:246-247` permite insert quando `coach_id = auth.uid()`, sem validar `is_coach`, convite, aceite ou membership.
- Impacto: qualquer usuario pode declarar outro perfil publico como aluno e criar contexto de acesso de coach.
- Recomendacao: exigir status `pending`, aceite pelo aluno, role `coach` validado e policy/RPC server-side.

**AUTH-04 - Policies RLS antigas continuam amplas apos migration de moderacao**

- Evidencia: `supabase/social-schema.sql:178-179` cria policy `"comments read"` com `using (true)`.
- Evidencia: `supabase/social-schema.sql:199-200` cria `"group members read"` com `using (true)`.
- Evidencia: `supabase/migrations/20260511051000_social_moderation_reports.sql:169-175` cria nova policy para comentarios, mas nao remove `"comments read"`. Policies Supabase sao combinadas por OR.
- Impacto: comentarios e membros de grupos podem continuar expostos alem do pretendido.
- Recomendacao: dropar policies legadas amplas e recriar policies unicas por visibilidade/membership.

### MEDIA

**AUTH-05 - Autorizacao de API nao tem middleware central de permissao**

- Evidencia: `api/_lib/server-supabase.ts:30-40` so valida sessao.
- Evidencia: billing usa entitlements em `api/gemini-proxy.ts:143-149`, mas outros endpoints sensiveis nao passam por uma camada comum de RBAC/ABAC.
- Impacto: cada endpoint reimplementa autorizacao, aumentando chance de lacuna.
- Recomendacao: criar helpers como `requireEntitlement`, `requireRole`, `requireWorkspaceMember`.

**AUTH-06 - Fluxos premium dependem de entitlements server-side, mas UI ainda tem previews locais**

- Evidencia: `src/services/billingService.ts:48-83` busca billing no servidor.
- Evidencia: `src/components/BillingCenter.tsx` contem comentarios `dataMode: 'mock_dev_only'` e previews locais.
- Impacto: produto mistura fluxo real e preview, dificultando auditoria de acesso premium.
- Recomendacao: separar componentes de preview de superficies que desbloqueiam valor real.

## 5. Evidencias positivas

- `api/_lib/server-supabase.ts:30-40` valida JWT Supabase via Admin.
- Billing entitlement e Gemini proxy usam userId autenticado, nao actorId vindo do cliente.
- Varias migrations usam `auth.uid() = user_id`.

## 6. Riscos para SaaS real

- Cross-tenant leakage quando houver empresas/workspaces.
- Abuso de gamificacao e moedas.
- Relacoes coach/aluno sem consentimento.
- Exposicao social por policies antigas amplas.

## 7. Recomendacoes priorizadas

1. Modelar workspace/tenant e roles antes de vender B2B.
2. Fechar RPCs e eventos de gamificacao server-authoritative.
3. Corrigir RLS social removendo policies legadas amplas.
4. Criar convite/aceite para relacao coach/aluno.
5. Centralizar helpers de autorizacao em APIs.

## 8. Quick wins

- Dropar `"comments read"` e `"group members read"`.
- Tornar `coach_students` insert apenas via RPC com convite.
- Bloquear `workout_completed` se nao houver registro de treino server-side.

## 9. Itens que exigem decisao humana

- O produto sera B2C individual ou B2B multi-tenant?
- Quais roles existem: owner, admin, coach, atleta, billing_admin?
- O que conta como prova valida para recompensas de gamificacao?

## 10. Veredito final

**FAIL.** A autenticacao esta presente, mas a autorizacao ainda nao tem modelo SaaS robusto.
