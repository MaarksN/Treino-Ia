# Auditoria de Divida Tecnica - Testes

## 1. Resumo executivo

- **Veredito:** PASS WITH WARNINGS para quantidade de testes; FAIL para verificacao local nesta auditoria.
- **Severidade dominante:** ALTA
- **Fato confirmado:** o repo tem cobertura consideravel de unit tests em `src`, `api` e `tests`, alem de Playwright e CI basico.
- **Risco principal:** nao foi possivel executar test/typecheck/lint neste ambiente porque o runtime Node disponivel falhou com `Acesso negado` e `npm` nao esta no PATH. Alem disso, ha lacunas especificas em RLS/RPC, contratos OpenAPI e E2E no CI.

## 2. Escopo analisado

- `package.json`
- `vitest.config.ts`
- `playwright.config.ts`
- `.github/workflows/ci.yml`
- `.github/workflows/lighthouse.yml`
- `tests/**`, `src/**/*.test.*`, `api/**/*.test.ts`
- migrations SQL criticas.

## 3. Comandos executados

- `rg --files tests`
- `rg --files src | rg "\.test\.|\.spec\."`
- `rg --files api`
- `& .\node_modules\.bin\vitest.cmd --version` (falhou: `Acesso negado`)
- `& .\node_modules\.bin\tsc.cmd --version` (falhou: `Acesso negado`)
- `& .\node_modules\.bin\eslint.cmd --version` (falhou: `Acesso negado`)

## 4. Achados por severidade

### ALTA

**TEST-01 - Suites nao foram executaveis no ambiente atual**

- Evidencia: binarios locais `vitest.cmd`, `tsc.cmd`, `eslint.cmd` retornaram `Acesso negado`.
- Evidencia: `node --version` tambem falhou com `Acesso negado`; `npm`/`pnpm` nao foram reconhecidos.
- Impacto: a auditoria nao consegue afirmar que o estado atual passa em CI/local.
- Recomendacao: corrigir runtime Node local ou executar em CI; registrar versoes e saidas no proximo ciclo.

**TEST-02 - CI nao executa Playwright E2E**

- Evidencia: `package.json` tem `test:e2e`.
- Evidencia: `.github/workflows/ci.yml` executa lint, typecheck, unit tests e build, mas nao `npm run test:e2e`.
- Evidencia: `playwright.config.ts` existe e `tests/e2e` esta no worktree, mas aparece como untracked no `git status`.
- Impacto: regressao visual/fluxos autenticados podem nao bloquear merge.
- Recomendacao: adicionar job E2E com ambiente de build e mocks controlados ou projeto smoke.

**TEST-03 - RLS/RPC criticos nao tem testes suficientes**

- Evidencia: `tests/supabaseRlsCriticalTables.test.ts` cobre periodizacao.
- Evidencia: nao foram encontrados testes equivalentes para policies sociais amplas ou grants/revokes das RPCs de gamificacao.
- Impacto: falhas criticas de autorizacao SQL passam sem alarme.
- Recomendacao: testes estaticos lendo migrations para `revoke execute`, `set search_path`, ausencia de `using (true)` em tabelas privadas e grants esperados.

### MEDIA

**TEST-04 - Sem threshold de coverage**

- Evidencia: `vitest.config.ts` configura includes, mas nao coverage thresholds.
- Impacto: areas criticas podem perder cobertura sem falhar CI.
- Recomendacao: habilitar coverage por pacotes criticos: API, services, RLS static tests.

**TEST-05 - Contratos OpenAPI divergentes nao sao testados**

- Evidencia: `docs/api/openapi.yaml` documenta `GET /api/health/oauth/start`, mas `api/health/oauth/start.ts:68-75` implementa POST com body.
- Impacto: SDKs, docs e consumidores podem quebrar sem teste.
- Recomendacao: criar teste de contrato que compara OpenAPI com handlers.

**TEST-06 - Muitos testes usam mocks de Supabase, faltam integracao de DB**

- Evidencia: varios testes mockam `server-supabase` ou `supabaseClient`.
- Impacto: bugs de policies, constraints e migrations nao aparecem em unit tests.
- Recomendacao: adicionar suite de migration/static SQL e opcional smoke contra Supabase local.

## 5. Evidencias positivas

- O repo contem muitos testes em `src/**/*.test.*` e `api/**/*.test.ts`.
- CI separa lint, typecheck, test e build.
- Existem testes de billing, hardening do Gemini proxy, redacao, OAuth, retry e RLS de periodizacao.

## 6. Riscos para SaaS real

- Falhas de autorizacao SQL sem gate automatizado.
- E2E de login/billing/offline nao bloqueia merge.
- Contratos de API desatualizados.

## 7. Recomendacoes priorizadas

1. Restaurar runtime Node e rodar `npm run validate`.
2. Adicionar testes estaticos para migrations SQL criticas.
3. Subir E2E smoke no CI.
4. Adicionar contrato OpenAPI vs handlers.
5. Definir coverage minima para API e services.

## 8. Quick wins

- Teste que falha se `20260512000000_gamification.sql` nao contiver `revoke execute`.
- Teste que falha se `social-schema.sql` contiver `using (true)` em comentarios/memberships privados.
- CI job `npm run test:e2e` em PR com smoke reduzido.

## 9. Itens que exigem decisao humana

- Qual ambiente de teste E2E deve simular Supabase/Stripe.
- Qual coverage minima e aceitavel por fase.
- Se migrations devem ser testadas estaticamente ou com Supabase local.

## 10. Veredito final

**PASS WITH WARNINGS / FAIL operacional.** Ha uma base boa de testes, mas esta auditoria nao conseguiu executar a suite e encontrou lacunas nos pontos SaaS mais perigosos.
