# Evidence — Controlled Technical Sprint 04

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 04 — E2E Critical Flow Expansion  
**Base:** Commit c770171 — Add progressive coverage thresholds

---

## 1. Objetivo

Expandir a suíte E2E real de 4 smoke tests (Sprint 02) para cobrir fluxos críticos de UI que não requerem OAuth real, Billing real, secrets ou internet externa. Criar helper compartilhado de filtro de erros. Manter coverage gate e CI compatíveis.

---

## 2. Base auditada

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit inicial | `c770171` |
| Estado remoto | `Already up to date` |
| E2E existente | 1 spec, 4 testes (smoke) |
| Coverage thresholds | 25/20/25/25 |
| CI jobs | lint, typecheck, test, build, e2e, coverage |

---

## 3. E2E atual antes da sprint

| Spec | Testes | Cobertura |
|---|---|---|
| `app-smoke.spec.ts` | 4 | HTTP 200, title, #root, console errors |
| **Total** | **4** | Apenas boot/load |

Problemas identificados:
- Filtro de erros benignos inline e duplicado
- Nenhum fluxo de interação testado
- Onboarding tour sem teste
- Registration form sem teste
- Routing sem teste
- Security/leaks sem teste
- PWA meta tags sem teste

---

## 4. Fluxos candidatos

Avaliados 16 fluxos candidatos. Ver `flow-selection.md` para tabela completa.

---

## 5. Fluxos escolhidos

| Fluxo | Spec | Testes | Motivo |
|---|---|---|---|
| Onboarding tour | `onboarding-flow.spec.ts` | 3 | localStorage-driven, 7 steps, skip, back |
| Registration form | `registration-flow.spec.ts` | 3 | Local form, no OAuth, localStorage persistence |
| Navigation/routing | `navigation-security.spec.ts` | 2 | Root path, unknown path redirect |
| Security/leaks | `navigation-security.spec.ts` | 2 | No secrets in HTML, no JS errors |
| PWA/HTML | `navigation-security.spec.ts` | 2 | Meta tags, lang, charset |
| **Total novos** | | **12** | |

Fluxos não escolhidos: Dashboard UI, Workout, Recovery, AI, Billing, PWA offline, CSP, OAuth, Stripe — ver `flow-selection.md` para motivos.

---

## 6. Specs/testes criados ou ajustados

### Criados

| Arquivo | Tipo | Testes |
|---|---|---|
| `tests/e2e/helpers/console.ts` | Helper | — |
| `tests/e2e/onboarding-flow.spec.ts` | Spec | 3 |
| `tests/e2e/registration-flow.spec.ts` | Spec | 3 |
| `tests/e2e/navigation-security.spec.ts` | Spec | 6 |

### Ajustados

| Arquivo | Mudança |
|---|---|
| `tests/e2e/app-smoke.spec.ts` | Refatorado para usar `helpers/console.ts`; filtro inline removido |

---

## 7. Resultado real do E2E

```
Running 16 tests using 1 worker

  ok  1 [chromium] › app-smoke.spec.ts › App smoke › app loads with status 200 (587ms)
  ok  2 [chromium] › app-smoke.spec.ts › App smoke › page title is set (467ms)
  ok  3 [chromium] › app-smoke.spec.ts › App smoke › React root element renders (488ms)
  ok  4 [chromium] › app-smoke.spec.ts › App smoke › no critical console errors on load (2.5s)
  ok  5 [chromium] › navigation-security.spec.ts › Navigation & routing › root path loads (608ms)
  ok  6 [chromium] › navigation-security.spec.ts › Navigation & routing › unknown path redirects (1.6s)
  ok  7 [chromium] › navigation-security.spec.ts › Security checks › no leaked secrets (2.5s)
  ok  8 [chromium] › navigation-security.spec.ts › Security checks › no JS errors (3.5s)
  ok  9 [chromium] › navigation-security.spec.ts › PWA & HTML › PWA meta tags (509ms)
  ok 10 [chromium] › navigation-security.spec.ts › PWA & HTML › HTML lang and charset (502ms)
  ok 11 [chromium] › onboarding-flow.spec.ts › Onboarding flow › complete all steps (1.4s)
  ok 12 [chromium] › onboarding-flow.spec.ts › Onboarding flow › skip button (987ms)
  ok 13 [chromium] › onboarding-flow.spec.ts › Onboarding flow › back button (1.0s)
  ok 14 [chromium] › registration-flow.spec.ts › Registration flow › form visible (1.4s)
  ok 15 [chromium] › registration-flow.spec.ts › Registration flow › form submit (2.6s)
  ok 16 [chromium] › registration-flow.spec.ts › Registration flow › return visit (2.6s)

  16 passed (26.8s)
```

---

## 8. Resultado real do coverage

```
Test Files  150 passed (150)
     Tests  578 passed (578)
  Duration  63.66s

All files | 26.06% Stmts | 22.71% Branch | 26.04% Funcs | 25.83% Lines

Thresholds:
  statements: 25% ← 26.06% ✅
  branches:   20% ← 22.71% ✅
  functions:  25% ← 26.04% ✅
  lines:      25% ← 25.83% ✅
```

---

## 9. Comandos executados

| Comando | Resultado |
|---|---|
| `git status --short` | ✅ Limpo antes da sprint |
| `git branch --show-current` | ✅ main |
| `git pull` | ✅ Already up to date |
| `git diff --check` | ✅ PASS |
| `npm run lint` | ✅ PASS |
| `npm run typecheck` | ✅ PASS |
| `npm test` | ✅ 150 files, 578 tests PASS |
| `npm run build` | ✅ PASS (1970 modules, 7.38s) |
| `npm run test:e2e` | ✅ 16/16 PASS (26.8s) |
| `npm run test:coverage` | ✅ PASS — thresholds preserved |

---

## 10. Riscos remanescentes

| Risco | Status |
|---|---|
| Dashboard/workout E2E | 🟡 Requer mock de DatabaseService — fora do escopo |
| OAuth/Billing sandbox | 🔴 Fora do escopo |
| CI E2E runtime | 🟡 ~27s — aceitável; monitorar |
| Componentes React unit | 🟡 0% — fora do escopo |

---

## 11. Próxima ação recomendada

```
Controlled Technical Sprint 05 — OAuth/Billing Sandbox Provisioning
```

Se secrets não disponíveis:

```
Controlled Technical Sprint 05 — React Component Test Harness Foundation
(Configurar react-testing-library + primeiro componente testado)
```
