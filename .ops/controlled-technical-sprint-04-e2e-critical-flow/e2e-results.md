# E2E Results — Controlled Technical Sprint 04

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 04 — E2E Critical Flow Expansion  
**Comando:** `npx playwright test`  
**Workers:** 1 | **Browser:** Chromium | **Duração total:** 26.8s

---

## Resultados por spec e teste

| Spec | Teste | Resultado | Tempo | Observação |
|---|---|---|---|---|
| `app-smoke.spec.ts` | app loads with status 200 | ✅ PASS | 587ms | Existente — sem alteração |
| `app-smoke.spec.ts` | page title is set | ✅ PASS | 467ms | Existente — sem alteração |
| `app-smoke.spec.ts` | React root element renders | ✅ PASS | 488ms | Existente — sem alteração |
| `app-smoke.spec.ts` | no critical console errors on load | ✅ PASS | 2.5s | Refatorado para usar helper |
| `navigation-security.spec.ts` | root path loads successfully | ✅ PASS | 608ms | **NOVO** |
| `navigation-security.spec.ts` | unknown path redirects to root | ✅ PASS | 1.6s | **NOVO** |
| `navigation-security.spec.ts` | page source does not leak secrets | ✅ PASS | 2.5s | **NOVO** |
| `navigation-security.spec.ts` | no JS ReferenceError or TypeError on load | ✅ PASS | 3.5s | **NOVO** |
| `navigation-security.spec.ts` | PWA meta tags are present | ✅ PASS | 509ms | **NOVO** |
| `navigation-security.spec.ts` | HTML document has correct lang and charset | ✅ PASS | 502ms | **NOVO** |
| `onboarding-flow.spec.ts` | tour visible + complete all steps | ✅ PASS | 1.4s | **NOVO** |
| `onboarding-flow.spec.ts` | skip button dismisses tour | ✅ PASS | 987ms | **NOVO** |
| `onboarding-flow.spec.ts` | back button navigates to previous step | ✅ PASS | 1.0s | **NOVO** |
| `registration-flow.spec.ts` | registration form visible after onboarding | ✅ PASS | 1.4s | **NOVO** |
| `registration-flow.spec.ts` | form submit persists starter user | ✅ PASS | 2.6s | **NOVO** |
| `registration-flow.spec.ts` | form not shown on return visit | ✅ PASS | 2.6s | **NOVO** |

---

## Resumo

| Métrica | Valor |
|---|---|
| **Specs** | 4 |
| **Testes totais** | 16 |
| **Passaram** | 16 |
| **Falharam** | 0 |
| **Flaky** | 0 |
| **Duração** | 26.8s |
| **Testes novos** | 12 |
| **Testes existentes** | 4 |
| **Crescimento** | +300% (4 → 16) |

---

## Evolução E2E

| Sprint | Specs | Testes | Tempo | Nota |
|---|---|---|---|---|
| Sprint 02 | 1 | 4 | 17.1s | Smoke boot only |
| **Sprint 04** | **4** | **16** | **26.8s** | +12 testes: onboarding, registration, navigation, security, PWA |
