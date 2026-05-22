# Stabilization Execution Sprint 04 Evidence

## 1. Objetivo

Validar OAuth e Billing em modo sandbox/controlado ou documentar bloqueio honesto caso ambiente sandbox, secrets ou autorizacao nao estejam disponiveis. Nenhuma producao real, OAuth nao autorizado, pagamento real, migration ou feature nova foram permitidos.

## 2. Base Auditada

- Branch: `main`.
- `git pull`: `Already up to date.`
- `git log --oneline -20` confirmou:
  - `2830e0c Merge pull request #98 from MaarksN/codex/stabilization-sprint-03-rollback`
  - `c8a201d Merge pull request #97 from MaarksN/codex/stabilization-sprint-02-observability`
  - `0764422 ci: skip e2e when Playwright is unavailable`
- Remote: `origin https://github.com/MaarksN/Treino-Ia.git`.
- Worktree inicial: somente `?? .ops/pr-41-review/`, preexistente e fora do escopo.

## 3. OAuth Sandbox Status

`BLOCKED WITH EVIDENCE`.

Nao havia sandbox autorizado, provider/test account, redirect allowlist, OAuth client id/secret, Supabase service role, token security mode ou encryption key configurados fora do repo. Nenhum OAuth real foi executado.

## 4. Billing Sandbox Status

`BLOCKED WITH EVIDENCE`.

Nao havia Stripe test mode autorizado, test secret key, webhook secret sandbox, price IDs test, Supabase service role ou usuario sandbox. Nenhum checkout, portal, webhook ou pagamento real foi executado.

## 5. Codigo Auditado

OAuth:

- `api/health/oauth/start.ts`
- `api/health/oauth/callback.ts`
- `api/_lib/oauthRedirect.ts`
- `api/_lib/oauthTokenCrypto.ts`
- `api/_lib/oauthTokenSecurity.ts`
- `api/_lib/http.ts`
- `api/_lib/redact.ts`
- `src/utils/errorTelemetry.ts`

Billing:

- `api/_lib/stripe-client.ts`
- `api/_lib/billing.ts`
- `api/_lib/billing-store.ts`
- `api/_lib/billing-entitlements.ts`
- `api/stripe/create-checkout-session.ts`
- `api/stripe/create-portal-session.ts`
- `api/stripe/webhook.ts`
- `api/billing/entitlement.ts`
- `src/services/billingService.ts`
- `src/components/PricingTable.tsx`
- `src/components/BillingCenter.tsx`
- `src/components/PremiumPaywall.tsx`

## 6. Codigo Alterado

Nenhum codigo de runtime, teste, schema ou migration foi alterado. Esta sprint criou apenas artefatos operacionais em `.ops/stabilization-execution-sprint-04-oauth-billing/`.

## 7. Testes Criados/Ajustados

Nenhum teste novo foi criado porque nao houve alteracao de codigo/helper. Testes existentes revisados como evidencia:

- `api/_lib/oauthRedirect.test.ts`
- `api/_lib/oauthTokenSecurity.test.ts`
- `api/_lib/oauthTokenCrypto.test.ts`
- `api/_lib/redact.test.ts`
- `api/_lib/http.test.ts`
- `api/_lib/billing.test.ts`

## 8. Smokes Executados

Smokes reais OAuth/Billing: nenhum, por bloqueio de sandbox/secrets/autorizacao.

Auditorias/smokes estaticos executados:

- OAuth start/callback guards.
- Redirect sanitization.
- State validation path.
- Redaction de code/token/state.
- Stripe config guard.
- Billing plan/price guard.
- Webhook signature/secret guard.
- Entitlement fallback.

## 9. Smokes Bloqueados

- OAuth provider roundtrip real.
- OAuth callback real com code/state sandbox.
- Stripe Checkout sandbox.
- Stripe Billing Portal sandbox.
- Stripe signed webhook sandbox.
- Entitlement pago via webhook real.

## 10. Comandos Executados

Base:

- `git status --short`
- `git branch --show-current`
- `git log --oneline -20`
- `git remote -v`
- `git pull`

Validacao inicial:

- `git diff --check`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git status --short`

Auditoria:

- `Get-Content -Raw` dos artefatos P11/P12/post-launch/Sprint 02/Sprint 03.
- `rg --files api/health/oauth api/_lib src/utils`
- `rg -n -i "oauth|redirectTo|redirect_uri|state|code|access_token|refresh_token|scope" api src`
- `rg -n -i "stripe|billing|checkout|payment|subscription|price|webhook" api src`
- `Select-String -Path "api\**\*","src\**\*" -Pattern "oauth","redirectTo","redirect_uri","state","code","access_token","refresh_token","scope" -ErrorAction SilentlyContinue`
- `Select-String -Path "api\**\*","src\**\*" -Pattern "stripe","billing","checkout","payment","subscription","price","webhook" -ErrorAction SilentlyContinue`
- Environment presence check with redacted `SET/MISSING` output only.
- `npm pkg get scripts`
- `Get-ChildItem -Force -Name ".env*"`
- `rg --files | rg -i "(^|/)(supabase|migrations?)/|\.sql$"`

Validacao final:

- `git diff --check`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git status --short`

## 11. Resultado Real dos Comandos

Base:

- `git status --short`: `?? .ops/pr-41-review/` antes da sprint, preexistente/fora do escopo.
- `git branch --show-current`: `main`.
- `git pull`: `Already up to date.`
- PR #97, PR #98 e hotfix E2E skip honesto presentes no historico.

Validacao inicial:

- `git diff --check`: PASS.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 146 test files e 562 tests.
- `npm run build`: PASS.
- `git status --short`: apenas `?? .ops/pr-41-review/`.

Auditoria:

- Environment check: todos os secrets/configs OAuth, Supabase, Stripe, webhook e price IDs estavam `MISSING`.
- `.env*`: apenas `.env.example` existe no workspace.
- `npm pkg get scripts`: nao ha `test:e2e` nem `test:coverage`.
- E2E: `E2E NOT AVAILABLE / SKIPPED - risco ja aceito e tratado no Sprint 01`.

Validacao final:

- `git diff --check`: PASS.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 146 test files e 562 tests.
- `npm run build`: PASS.
- `git status --short`: artefatos Sprint 04 novos mais `?? .ops/pr-41-review/` preexistente.

## 12. Riscos Remanescentes

- OAuth sandbox real segue pendente.
- Billing sandbox real segue pendente.
- Secrets sandbox nao foram fornecidos.
- Webhook secret sandbox pendente.
- Redirect allowlist pendente.
- Payload minimization do webhook Stripe aberta.
- E2E/Coverage seguem bloqueados/aceitos.
- Rollback real em deploy provider segue pendente.

## 13. Proxima Acao

Provisionar ambiente sandbox autorizado para OAuth e Stripe com secrets fora do repo, allowlists configuradas, test keys confirmadas e webhook signing secret sandbox. Antes de rodar webhook sandbox real, decidir sobre minimizacao do payload Stripe persistido.
