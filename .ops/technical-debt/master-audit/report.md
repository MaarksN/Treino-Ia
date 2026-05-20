# Auditoria mestre de dividas tecnicas - Rodada 1

Data: 2026-05-20  
Repositorio: Treino-Ia  
Origem dos criterios: `C:\Users\Marks\Desktop\codex-prompts-dividas-tecnicas-saas-txt\codex-prompts-dividas-tecnicas-saas-txt`

## 1. Resumo executivo

Veredito: **FAIL para SaaS real em producao multi-tenant**.

O projeto tem sinais bons de evolucao: CI basico, Vercel, Stripe webhook assinado, Supabase RLS em parte do dominio, documentacao operacional, testes unitarios e uma estrutura grande de features. Ainda assim, a auditoria encontrou bloqueadores de maturidade SaaS:

- Existem servicos de produto apontando para tabelas que nao aparecem nas migrations versionadas.
- O modelo global de tenant/workspace nao esta consolidado.
- Ha funcoes RPC `security definer` sensiveis sem hardening de grants, `search_path` e separacao clara entre service role e cliente autenticado.
- Partes importantes do produto ainda operam como demo local, mock ou simulacao.
- Auditoria, sessoes ativas, webhooks, retencao, health sync e controles de seguranca tem trechos locais/in-memory ou incompletos.
- A suite de testes nao pode ser executada no ambiente atual porque `node.exe` retorna `Acesso negado`, e o CI nao executa E2E.

Esta rodada priorizou as categorias mais criticas para SaaS real: seguranca, autenticacao/autorizacao, banco de dados, auditoria, testes e fake/mocks. Os prompts de todas as 30 categorias foram lidos e usados como matriz de avaliacao inicial.

## 2. Estado inicial do repositorio

Branch observada: `main`.

Arquivos ja modificados antes desta auditoria:

- `.gitignore`
- `package-lock.json`
- `package.json`
- `.ops/stabilization-execution-sprint-01-e2e-coverage/`
- `.ops/technical-debt/`
- `playwright.config.ts`
- `tests/e2e/`

Observacao: estes itens nao foram revertidos nem normalizados. A auditoria trabalha em cima do estado existente.

## 3. Escopo executado nesta rodada

Auditorias individuais criadas:

- `.ops/technical-debt/divida_seguranca/report.md`
- `.ops/technical-debt/divida_auth_autorizacao/report.md`
- `.ops/technical-debt/divida_banco_dados/report.md`
- `.ops/technical-debt/divida_auditoria/report.md`
- `.ops/technical-debt/divida_testes/report.md`
- `.ops/technical-debt/divida_fake_mocks_placeholders/report.md`

Auditorias ja existentes consideradas:

- `.ops/technical-debt/01-arquitetura.md`
- `.ops/technical-debt/02-multi-tenancy.md`

## 4. Mapa da arquitetura observada

Superficie principal:

- Frontend React/Vite em `src/`.
- APIs serverless em `api/`.
- Supabase como banco/autenticacao/RLS em `supabase/`.
- Stripe para billing em `api/stripe/`.
- Playwright e Vitest presentes em scripts.
- Documentacao em `docs/`.

Padroes relevantes encontrados:

- Algumas areas tem backend real e RLS, especialmente social, billing e gamification.
- Outras areas ainda estao no frontend/service layer com persistencia local, tabelas ausentes ou simulacoes.
- O produto contem conceitos de white-label/tenant em tipos e servicos, mas o banco e a autorizacao global ainda sao centrados em `user_id`.
- Existem schemas SQL standalone e migrations oficiais divergentes para billing/gamification.

## 5. Matriz das 30 dividas tecnicas

| # | Categoria | Status | Observacao principal |
|---|---|---|---|
| 01 | Arquitetura | FAIL | Componentes e servicos muito grandes, acoplamento alto e auditoria anterior ja marcada como FAIL. |
| 02 | Multi-tenancy | FAIL | Nao ha tenant/workspace global nas tabelas e politicas centrais. |
| 03 | Seguranca | FAIL | RPCs sensiveis, CORS amplo, redirects Stripe por `Origin` e limites de body inconsistentes. |
| 04 | Auth/Autorizacao | FAIL | Autorizacao individual existe, mas faltam escopos tenant, consentimento e separacao robusta de eventos privilegiados. |
| 05 | Dominio/Regras | PASS WITH WARNINGS | Regras espalhadas entre UI, servicos e JSONB; falta consolidacao de invariantes de dominio. |
| 06 | Banco de dados | FAIL | Tabelas usadas pelo codigo nao existem em migrations; schemas duplicados/divergentes. |
| 07 | Performance | PASS WITH WARNINGS | Arquivos grandes e risco de renderizacao pesada; sem execucao local de benchmarks. |
| 08 | Escalabilidade | FAIL | Rate limits, stores e workers in-memory/local em fluxos relevantes. |
| 09 | Confiabilidade | PASS WITH WARNINGS | Alguns timeouts/retries existem, mas webhooks/provedores/jobs ainda tem lacunas. |
| 10 | Observabilidade | PASS WITH WARNINGS | Telemetria existe, mas sem trilha distribuida consistente. |
| 11 | Auditoria | FAIL | Servico de auditoria principal persiste em `localStorage`. |
| 12 | Testes | FAIL | Suite nao executavel neste ambiente e E2E fora do CI. |
| 13 | Contratos/API | FAIL | OpenAPI diverge de handlers e nao ha contract tests suficientes. |
| 14 | Frontend | PASS WITH WARNINGS | UI ampla, mas componentes grandes e telas misturam simulacao com produto real. |
| 15 | UX/Product debt | FAIL | Usuario pode enxergar funcoes como reais quando partes ainda sao mock/dev-only. |
| 16 | Integracoes | FAIL | OAuth/sync/webhooks tem implementacoes parciais ou locais. |
| 17 | Workflows/Jobs | FAIL | Jobs existem, mas faltam worker real, DLQ, idempotencia forte e operacao. |
| 18 | Agentes/IA | PASS WITH WARNINGS | Ha proxy/gateway, mas algumas respostas sao estaticas/deterministicas. |
| 19 | Billing | FAIL | Stripe webhook e bom inicio, mas ha redirects por `Origin` e schemas duplicados. |
| 20 | DevOps/CI-CD | PASS WITH WARNINGS | CI basico existe; falta E2E e ambiente local esta quebrado. |
| 21 | Dependencias | PASS WITH WARNINGS | Lockfile existe; nao foi possivel rodar auditoria de vulnerabilidades. |
| 22 | Config/Ambiente | FAIL | Runtime local Node/NPM indisponivel e validacao de ambiente incompleta. |
| 23 | Documentacao | PASS WITH WARNINGS | Documentos existem, mas ha sinais de drift com codigo e OpenAPI. |
| 24 | Migracao de dados | FAIL | Dados legados/localStorage e JSONB sem estrategia clara de migracao. |
| 25 | Compliance/Privacidade | FAIL | Export/delete/audit ainda locais em fluxos sensiveis. |
| 26 | Custos | PASS WITH WARNINGS | Controles existem parcialmente, mas sem governanca de custo por tenant/feature. |
| 27 | Qualidade de codigo | PASS WITH WARNINGS | Codigo organizado, porem com arquivos enormes e muita responsabilidade concentrada. |
| 28 | Fake/Mocks/Placeholders | FAIL | Varias features criticas ainda usam mock, localStorage ou dados estaticos. |
| 29 | Operacao/Suporte | FAIL | Falta console operacional real, trilha auditavel e ferramentas seguras de suporte. |
| 30 | Governanca tecnica | PASS WITH WARNINGS | Ha docs/ops, mas faltam guardrails como CODEOWNERS, DoD e gates por categoria. |

## 6. Top achados por severidade

1. Codigo referencia tabelas ausentes em migrations versionadas para health, nutrition, retention, tenants e students.
2. RPCs de gamification usam `security definer` sem grants restritos, sem `search_path` fixo e aceitam deltas/recompensas.
3. Nao ha modelo global de tenant/workspace nos limites de dados e autorizacao.
4. Schemas de billing/gamification estao duplicados e divergentes entre SQL standalone e migrations.
5. Politicas sociais amplas antigas podem continuar ativas porque RLS combina policies por OR.
6. Stripe checkout/portal monta redirect a partir de `Origin` nao confiavel.
7. Eventos de gamification podem ser enviados pelo cliente como fonte de recompensas.
8. Webhook service registra configuracoes/eventos em `localStorage` e UI simula envio.
9. Audit log principal grava em `localStorage`.
10. Session service usa sessoes ativas hardcoded.
11. CORS wildcard aparece em helpers/API.
12. Limite de body JSON depende de cada handler passar `maxBytes`.
13. E2E existe em scripts, mas nao roda no CI.
14. Testes locais nao rodam no ambiente atual por erro de permissao no Node.
15. Vinculo coach/student pode ser criado ativo por username, sem consentimento robusto.
16. Stripe webhook persiste payload completo do evento.
17. OpenAPI documenta rota health OAuth como GET enquanto handler usa POST.
18. Rate limit, caches e filas usam memoria local em pontos relevantes.
19. Training profile/plan/history usa JSONB para entidades centrais.
20. CSRF/rate-limit de UI sao demonstrativos em `localStorage`.

## 7. Riscos criticos para SaaS real

SaaS multi-tenant exige isolamento por organizacao, workspace ou tenant em todos os acessos. Hoje o sistema ainda parece um produto single-user com conceitos de tenant adicionados em alguns servicos. Isso cria risco de evolucao inconsistente: novas features podem parecer multi-tenant na UI, mas continuar sem isolamento no banco.

O segundo risco e integridade de negocio. Gamification, billing, audit, retention e health sao areas que influenciam experiencia, cobranca, privacidade e reputacao. Quando partes ficam em localStorage/mock ou dependem de chamadas client-side sem autoridade do servidor, o produto fica vulneravel a fraude, divergencia de dados e suporte impossivel.

## 8. Lacunas de seguranca e multi-tenancy

- Definir `tenant_id`/`workspace_id` como conceito estrutural ou assumir explicitamente que o produto e single-tenant por usuario.
- Migrar tabelas centrais para escopo tenant quando aplicavel.
- Reescrever policies RLS com testes negativos por tenant/role.
- Restringir RPCs sensiveis a `service_role` ou roles internas, com `revoke execute`, grants explicitos e `set search_path`.
- Validar origem de redirect Stripe por allowlist de app URL.
- Centralizar CORS, body limits e metodo HTTP por rota.
- Remover controles demonstrativos de seguranca da superficie apresentada como produto.

## 9. Lacunas de testes e CI/CD

- `npm run test`, `npm run typecheck`, `npm run lint` e `npm run test:e2e` nao foram executados por falha de permissao no runtime Node local.
- CI executa lint/typecheck/unit/build, mas nao `npm run test:e2e`.
- Faltam testes de policy/RPC para gamification e social RLS.
- Faltam contract tests para OpenAPI vs handlers.
- Faltam testes que falhem quando services referenciam tabelas sem migration.

## 10. Lacunas de produto fake/mockado

Areas com risco de serem confundidas com produto final:

- Health/nutrition/retention com `mock_dev_only` e tabelas ausentes.
- Webhooks locais em `localStorage`.
- Sessoes ativas hardcoded.
- Gamification state com partes reais misturadas com missoes/cosmeticos/clan mockados ou vazios.
- Educacao AI com respostas estaticas deterministicas.
- Controles CSRF/rate-limit demonstrativos.

## 11. Recomendacoes por fase

Fase 0 - bloqueadores:

- Corrigir ou remover referencias a tabelas ausentes.
- Hardening das RPCs de gamification.
- Decidir e implementar estrategia global de tenant/workspace.
- Corrigir RLS social ampla e testar policies antigas.

Fase 1 - seguranca e autorizacao:

- Centralizar CORS, body limits e allowlist de redirects.
- Tornar eventos de gamification server-authoritative.
- Adicionar consentimento/convite no fluxo coach/student.
- Substituir controles locais por implementacao server-side.

Fase 2 - dados e auditoria:

- Escolher uma fonte unica de schema Supabase.
- Mover audit log, sessoes, webhooks e privacidade para persistencia auditavel.
- Minimizar payloads Stripe persistidos.

Fase 3 - testes e CI:

- Resolver runtime local Node/NPM.
- Adicionar E2E ao CI.
- Criar testes de RLS/RPC, contract tests e migration coverage.

Fase 4 - produto e operacao:

- Separar claramente feature real, beta e mock.
- Criar console operacional de suporte com trilha auditavel.
- Adicionar governanca tecnica: CODEOWNERS, DoD, checklist de migrations/RLS/testes.

## 12. Veredito final

**FAIL**.

O sistema ainda nao deve ser tratado como SaaS multi-tenant pronto para producao. A base tem material suficiente para evoluir, mas os bloqueadores de schema, tenant isolation, RPC security, mocks persistentes e testes impedem uma aprovacao segura.

