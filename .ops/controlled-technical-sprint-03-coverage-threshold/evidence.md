# Evidence — Controlled Technical Sprint 03

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 03 — Coverage Threshold Definition  
**Base:** Commit 0dfc5c7 — Assess E2E and coverage registry allowlist

---

## 1. Objetivo

Transformar o coverage real capturado na Sprint 02 em gate progressivo com threshold conservador, documentação completa e validação.

---

## 2. Base auditada

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit inicial | `0dfc5c7` |
| Estado remoto | `Already up to date` |
| `test:coverage` existia? | ✅ Sim — Sprint 02 |
| `test:e2e` existia? | ✅ Sim — Sprint 02 |
| `coverage.thresholds` existia? | ❌ Não — apenas comentário |
| Job `coverage` em CI? | ❌ Não |

---

## 3. Baseline usado

Fonte: `coverage/coverage-summary.json` (gerado na Sprint 02, confirmado via `node` e `view_file`)

| Métrica | Valor exato | Representação fracionária |
|---|---:|---|
| Statements | 26.06% | 2983/11446 |
| Branches | 22.71% | 1970/8674 |
| Functions | 26.04% | 886/3402 |
| Lines | 25.83% | 2603/10076 |

---

## 4. Threshold definido

| Métrica | Baseline | Threshold | Margem |
|---|---:|---:|---:|
| Statements | 26.06% | **25%** | -1.06% |
| Branches | 22.71% | **20%** | -2.71% |
| Functions | 26.04% | **25%** | -1.04% |
| Lines | 25.83% | **25%** | -0.83% |

Critério: ~1-2% abaixo do baseline para absorver arredondamento e flutuação mínima entre execuções.

---

## 5. Config alterada

### `vitest.config.ts` — Antes

```ts
// No thresholds in baseline sprint — capturing current state only
```

### `vitest.config.ts` — Depois

```ts
// Progressive thresholds — Sprint 03 (Conservative baseline gate)
// Baseline from Sprint 02: Stmts 26.06%, Branches 22.71%, Funcs 26.04%, Lines 25.83%
// Thresholds set ~1-2% below baseline to allow rounding tolerance.
// Increase by +5% increments in future sprints as coverage improves.
thresholds: {
  statements: 25,
  branches: 20,
  functions: 25,
  lines: 25,
},
```

---

## 6. CI alterado

Adicionado job `coverage` ao final de `.github/workflows/ci.yml`:

```yaml
coverage:
  runs-on: ubuntu-latest
  timeout-minutes: 20
  needs:
    - lint
    - typecheck
    - test
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4 (node: 22, cache: npm)
    - run: npm ci
    - name: Coverage with threshold gate
      run: npm run test:coverage
    - name: Upload coverage report
      if: always()
      uses: actions/upload-artifact@v4
```

**Justificativa:** O job é real — usa `npm run test:coverage` sem `|| true`, sem `continue-on-error`. Se o threshold for violado, o CI falha. O job é paralelo ao `e2e`, dependendo apenas de `lint + typecheck + test`.

---

## 7. Comandos executados

| Comando | Resultado |
|---|---|
| `git status --short` | ✅ Limpo antes da sprint |
| `git pull` | ✅ Already up to date |
| `git diff --check` | ✅ PASS |
| `npm run lint` | ✅ PASS |
| `npm run typecheck` | ✅ PASS |
| `npm test` | ✅ 150 files, 578 tests PASS |
| `npm run build` | ✅ PASS |
| `npm run test:e2e` | ✅ 4/4 PASS |
| `npm run test:coverage` | ✅ 150 files, 578 tests, threshold PASS |

---

## 8. Resultado real dos comandos

### npm run test:coverage (com threshold)

```
Test Files  150 passed (150)
     Tests  578 passed (578)
  Duration  64.21s

% Coverage report from v8
All files | 26.07% Stmts | 22.71% Branch | 26.07% Funcs | 25.84% Lines

Thresholds:
  statements: 25% ← 26.07% ✅
  branches:   20% ← 22.71% ✅
  functions:  25% ← 26.07% ✅
  lines:      25% ← 25.84% ✅
```

### npm run test:e2e

```
Running 4 tests using 1 worker
  ok 1 [chromium] › App smoke › app loads with status 200 (1.1s)
  ok 2 [chromium] › App smoke › page title is set (758ms)
  ok 3 [chromium] › App smoke › React root element renders (912ms)
  ok 4 [chromium] › App smoke › no critical console errors on load (2.7s)
  4 passed (17.1s)
```

---

## 9. Riscos remanescentes

| Risco | Status |
|---|---|
| Componentes React 0% cobertura | 🟡 Ativo — fora do escopo |
| OAuth/Billing sandbox | 🔴 Fora do escopo |
| CI tempo (20min timeout) | 🟡 Monitorar |
| Threshold regredindo por arquivos novos | 🟡 Margem de ~1-2% absorve 1-2 arquivos |

---

## 10. Próxima ação recomendada

```
Controlled Technical Sprint 04 — OAuth/Billing Sandbox Provisioning
```

Se ambiente não disponível:

```
Controlled Technical Sprint 04 — E2E Critical Flow Expansion
(expandir os smoke testes para login, billing, onboarding)
```
