# Roadmap priorizado de saneamento tecnico

Data: 2026-05-20  
Base: auditoria mestre de dividas tecnicas - Rodada 1

## Principio de ordenacao

Prioridade vem de quatro criterios:

1. Risco de vazamento, fraude ou bypass de autorizacao.
2. Risco de runtime quebrado por schema inexistente.
3. Risco de cliente acreditar que uma capacidade mockada e real.
4. Capacidade de criar testes/gates que impeçam regressao.

## Fase 0 - Bloqueadores antes de expandir produto

Objetivo: estabilizar o que impede SaaS real.

1. Inventariar todas as tabelas referenciadas por services e comparar com migrations.
2. Criar migrations faltantes ou remover/ocultar features que dependem delas.
3. Reconciliar `supabase/billing-gamification-schema.sql` com migrations oficiais.
4. Hardening das RPCs de gamification:
   - `revoke execute` publico.
   - grants explicitos.
   - `set search_path`.
   - apenas service role para operacoes de recompensa.
5. Decidir modelo global de tenant/workspace:
   - single-user SaaS com isolamento por `user_id`, ou
   - SaaS B2B/B2B2C com `tenant_id`/`workspace_id`.

Entregavel de aceite:

- Script/teste que falha se codigo referencia tabela sem migration.
- Teste RLS/RPC que prova que usuario autenticado comum nao executa RPC privilegiada.
- Documento curto com decisao de tenancy e impacto por tabela.

## Fase 1 - Seguranca, auth e RLS

Objetivo: fechar bypasses previsiveis.

1. Corrigir policies sociais amplas:
   - dropar policies antigas permissivas por nome.
   - recriar policies por relacao/role/status.
   - testar leitura negativa.
2. Trocar eventos client-side de gamification por eventos server-authoritative.
3. Implementar fluxo coach/student por convite pendente e aceite.
4. Centralizar CORS em allowlist.
5. Trocar redirects Stripe baseados em `Origin` por `APP_URL` canonical ou allowlist.
6. Definir limite default de body para `readJsonObject`.

Entregavel de aceite:

- Testes cobrindo acesso negado entre usuarios/tenants.
- Testes de checkout/portal rejeitando origem nao permitida.
- Testes de payload grande rejeitado com status esperado.

## Fase 2 - Dados auditaveis e remocao de fakes criticos

Objetivo: transformar funcoes apresentadas como produto em backend real.

1. Mover `auditLogService` para persistencia server-side append-only.
2. Mover `webhookService` para backend:
   - assinatura HMAC.
   - retries.
   - logs.
   - timeout.
   - idempotencia.
3. Implementar sessoes ativas reais ou remover tela de gestao de sessoes.
4. Reduzir payload Stripe persistido ao envelope minimo.
5. Classificar health/nutrition/retention:
   - real agora,
   - beta explicito,
   - ou feature flag desligada.

Entregavel de aceite:

- Nenhum fluxo de seguranca/privacidade/webhook depende de localStorage.
- UI mostra estado real vindo de backend ou fica atras de feature flag.

## Fase 3 - Testes e CI/CD

Objetivo: tornar a auditoria reproduzivel.

1. Corrigir runtime Node/NPM local.
2. Rodar e registrar:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
   - `npm run test:e2e`
   - `npm run build`
3. Adicionar `npm run test:e2e` ao CI com artefatos Playwright.
4. Criar contract tests OpenAPI vs handlers.
5. Adicionar testes de migrations/RLS/RPC.
6. Definir cobertura minima progressiva no Vitest.

Entregavel de aceite:

- CI bloqueia PR com falha de lint/typecheck/unit/build/E2E basico.
- Auditoria local e CI conseguem reproduzir os mesmos comandos.

## Fase 4 - Integracoes, jobs e confiabilidade

Objetivo: reduzir comportamento parcial/in-memory.

1. Health OAuth/sync:
   - alinhar OpenAPI e handler.
   - buscar dados reais do provider ou declarar mock/beta.
2. Jobs:
   - worker real.
   - DLQ.
   - retries.
   - idempotency key.
   - painel de estado.
3. Retention webhooks:
   - timeout.
   - assinatura.
   - replay protection.
   - logs persistentes.
4. Rate limits distribuidos por usuario/tenant/IP.
5. Observabilidade:
   - correlation id.
   - logs estruturados.
   - metricas por rota/tenant.

Entregavel de aceite:

- Jobs sobrevivem a mais de uma instancia.
- Webhooks tem entrega verificavel.
- Erros conseguem ser rastreados por request/user/tenant.

## Fase 5 - Governanca e operacao

Objetivo: impedir retorno da divida.

1. Criar CODEOWNERS por areas sensiveis:
   - Supabase/RLS.
   - Billing.
   - Auth.
   - Privacy/audit.
   - Infra/CI.
2. Criar Definition of Done para features SaaS:
   - migration.
   - RLS.
   - testes negativos.
   - OpenAPI/contract.
   - observabilidade.
   - feature flag quando parcial.
3. Criar template de PR com checklist tecnico.
4. Criar rotulo/estado de produto:
   - real.
   - beta.
   - mock/dev-only.
5. Criar rotina mensal de auditoria das 30 categorias.

Entregavel de aceite:

- Toda feature critica passa por checklist automatizado/manual antes de merge.
- Mocks e placeholders nao chegam a tela final sem rotulo/flag explicito.

## Sequencia recomendada de PRs

1. `fix/gamification-rpc-hardening`
2. `fix/schema-source-of-truth`
3. `fix/social-rls-policies`
4. `feat/tenant-scope-decision-and-foundation`
5. `fix/security-http-defaults`
6. `fix/stripe-redirect-allowlist`
7. `feat/server-audit-log`
8. `feat/backend-webhooks`
9. `test/rls-rpc-contract-coverage`
10. `ci/playwright-e2e-gate`

