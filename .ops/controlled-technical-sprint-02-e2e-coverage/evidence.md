# Evidence — Controlled Technical Sprint 02

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 02 — Playwright/Coverage Registry Allowlist  
**Executor:** Staff Engineer Agent  
**Base anterior:** Commit 1837620 — Minimize Stripe webhook persisted payload

---

## 1. Objetivo

Verificar se as dependências de E2E/Coverage estão liberadas no registry npm e, se estiverem, implementar base real mínima de Playwright E2E e Vitest Coverage.

---

## 2. Base auditada

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit inicial | `1837620` — Minimize Stripe webhook persisted payload |
| Estado remoto | `Already up to date` (após `git pull`) |
| Scripts existentes antes | `test`, `test:watch`, `lint`, `typecheck`, `build`, `validate` |
| `test:e2e` | ❌ Não existia |
| `test:coverage` | ❌ Não existia |

---

## 3. Estado inicial

| Validação | Resultado |
|---|---|
| `git diff --check` | ✅ Limpo |
| `npm run lint` | ✅ PASS |
| `npm run typecheck` | ✅ PASS |
| `npm test` | ✅ 150 files, 578 tests, PASS |
| `npm run build` | ✅ PASS |
| `test:e2e` existia? | ❌ Não |
| `test:coverage` existia? | ❌ Não |

---

## 4. Dependências verificadas

| Dependência | Comando | Resultado |
|---|---|---|
| `@playwright/test` | `npm view @playwright/test version` | ✅ `1.60.0` — LIBERADA |
| `@vitest/coverage-v8` | `npm view @vitest/coverage-v8 version` | ✅ `4.1.7` — LIBERADA |
| Playwright CLI | `npx playwright --version` (pós-install) | ✅ `Version 1.60.0` |
| Chromium browser | `npx playwright install chromium --dry-run` | ✅ Instalado em `%LOCALAPPDATA%\ms-playwright\chromium-1223` |

### Instalação controlada

```
npm install -D @vitest/coverage-v8
→ added 13 packages, removed 3 packages, changed 8 packages

npm install -D @playwright/test
→ added 3 packages

npx playwright install chromium
→ SUCCESS (saída vazia — já instalado / instalado com sucesso)
```

---

## 5. Trilha escolhida

**AMBAS** — Playwright E2E (principal) + Vitest Coverage (complementar)

Conforme critério: ambas liberadas, browser CI suportado, sem conflito entre as trilhas.

---

## 6. Código/scripts/configs alterados

| Arquivo | Ação | Descrição |
|---|---|---|
| `playwright.config.ts` | ✅ CRIADO | Config Playwright: Chromium headless, `vite preview` porta 4173, 30s timeout |
| `tests/e2e/app-smoke.spec.ts` | ✅ CRIADO | Smoke spec real: 4 testes (200 OK, title, #root, sem erros críticos) |
| `vitest.config.ts` | ✅ MODIFICADO | Adicionado `coverage.provider: v8`, excluído `tests/e2e/**` |
| `package.json` | ✅ MODIFICADO | Adicionados scripts `test:e2e` e `test:coverage` |

---

## 7. Testes/coverage executados

### E2E (Playwright)
```
Running 4 tests using 1 worker

  ok 1 [chromium] › app-smoke.spec.ts › App smoke › app loads with status 200 (866ms)
  ok 2 [chromium] › app-smoke.spec.ts › App smoke › page title is set (449ms)
  ok 3 [chromium] › app-smoke.spec.ts › App smoke › React root element renders (467ms)
  ok 4 [chromium] › app-smoke.spec.ts › App smoke › no critical console errors on load (2.4s)

  4 passed (7.1s)
```

### Coverage (Vitest + v8)
```
Test Files  150 passed (150)
      Tests  578 passed (578)
   Duration  52.04s

Coverage report from v8:
All files | 26.06% Stmts | 22.71% Branch | 26.04% Funcs | 25.83% Lines
```

---

## 8. Resultado real dos comandos

| Comando | Resultado |
|---|---|
| `git diff --check` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run typecheck` | ✅ 0 erros |
| `npm test` | ✅ 150 files, 578 tests |
| `npm run build` | ✅ dist gerado (366KB Dashboard chunk) |
| `npm run test:e2e` | ✅ 4/4 passed (7.1s) |
| `npm run test:coverage` | ✅ 578 tests + coverage report |

---

## 9. Riscos remanescentes

| Risco | Status |
|---|---|
| OAuth sandbox real | 🔴 ATIVO — fora do escopo |
| Billing sandbox real | 🔴 ATIVO — fora do escopo |
| Stripe webhook real | 🟡 WARNINGS ACEITOS |
| E2E flaky por recursos externos | 🟡 MITIGADO — filtro de erros benignos |
| Coverage threshold agressivo | 🟡 MITIGADO — sem threshold nesta sprint |
| Browser install em CI (tempo) | 🟡 MONITORAR — `npx playwright install --with-deps chromium` no CI |

---

## 10. Próxima ação

```
Controlled Technical Sprint 03 — OAuth/Billing Sandbox Provisioning
OU
Controlled Technical Sprint 03 — Coverage Threshold Definition
```

**Recomendado:** OAuth/Billing sandbox se ambiente autorizado disponível. Caso contrário, definir thresholds progressivos de coverage como Sprint 03.
