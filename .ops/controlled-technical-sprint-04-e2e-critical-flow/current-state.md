# Current State — Controlled Technical Sprint 04

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 04 — E2E Critical Flow Expansion  
**Base:** Commit c770171 — Add progressive coverage thresholds

---

## Estado antes da sprint

| Área | Arquivo | Estado atual | Risco | Ação nesta sprint |
|---|---|---|---|---|
| E2E smoke | `tests/e2e/app-smoke.spec.ts` | 4 testes: HTTP 200, title, #root, console errors | Cobertura limitada a boot | Refatorar para usar helper compartilhado |
| E2E config | `playwright.config.ts` | Chromium, workers: 1, preview server na 4173 | Estável | Manter sem alteração |
| E2E helpers | — | Não existe | Filtro de erros duplicado inline | Criar `helpers/console.ts` |
| Onboarding flow | — | Sem teste E2E | Tour não testado — risco de regressão | Criar `onboarding-flow.spec.ts` |
| Registration flow | — | Sem teste E2E | Registro local não testado | Criar `registration-flow.spec.ts` |
| Navigation/routing | — | Sem teste E2E | Rota desconhecida não testada | Criar `navigation-security.spec.ts` |
| Security/leaks | — | Sem teste E2E | Secrets podem vazar no HTML | Incluir em `navigation-security.spec.ts` |
| PWA meta tags | — | Sem teste E2E | Meta tags podem ser removidas | Incluir em `navigation-security.spec.ts` |
| Coverage gate | `vitest.config.ts` | Thresholds: 25/20/25/25 | Regressão se coverage cair | Manter — sem alteração |
| CI | `.github/workflows/ci.yml` | Jobs: lint, typecheck, test, build, e2e, coverage | Estável | Manter — sem alteração |

---

## Estado após a sprint

| Área | Arquivo | Estado após | Testes | Observação |
|---|---|---|---|---|
| E2E smoke | `tests/e2e/app-smoke.spec.ts` | Refatorado com helper compartilhado | 4 | Mesmo comportamento, código mais limpo |
| E2E helpers | `tests/e2e/helpers/console.ts` | **NOVO** — filtro centralizado de erros benignos | — | Usado por todos os specs |
| Onboarding flow | `tests/e2e/onboarding-flow.spec.ts` | **NOVO** — tour completo, skip, back | 3 | Determinístico via localStorage |
| Registration flow | `tests/e2e/registration-flow.spec.ts` | **NOVO** — form, submit, persistência, retorno | 3 | Sem OAuth, localStorage only |
| Navigation/Security | `tests/e2e/navigation-security.spec.ts` | **NOVO** — rotas, secrets, PWA, HTML | 6 | Sem dependência externa |
| **TOTAL** | | | **16** | De 4 → 16 testes (+300%) |
