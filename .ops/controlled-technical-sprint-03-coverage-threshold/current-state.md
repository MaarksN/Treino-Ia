# Current State — Controlled Technical Sprint 03

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 03 — Coverage Threshold Definition  
**Base:** Commit 0dfc5c7 (Assess E2E and coverage registry allowlist)

## Estado inicial dos scripts

| Script | Estado |
|---|---|
| `test:coverage` | ✅ Existia (`vitest run --coverage`) desde Sprint 02 |
| `test:e2e` | ✅ Existia (`playwright test`) desde Sprint 02 |

## Estado de thresholds antes da sprint

| Item | Estado |
|---|---|
| `coverage.thresholds` em `vitest.config.ts` | ❌ Não existia — comentário `No thresholds in baseline sprint` |
| Job `coverage` em `ci.yml` | ❌ Não existia |

## Baseline da Sprint 02 (JSON confirmado de `coverage/coverage-summary.json`)

| Métrica | Valor exato |
|---|---|
| Statements | 26.06% (2983/11446) |
| Branches | 22.71% (1970/8674) |
| Functions | 26.04% (886/3402) |
| Lines | 25.83% (2603/10076) |

## Tabela de estado completa

| Área | Arquivo | Estado atual | Risco | Ação nesta sprint |
|---|---|---|---|---|
| Coverage thresholds | `vitest.config.ts` | Sem threshold — sprint baseline | Médio — sem gate real | Adicionado threshold conservador |
| CI coverage job | `.github/workflows/ci.yml` | Sem job de coverage | Médio — coverage não valida no CI | Adicionado job `coverage` real |
| Script `test:coverage` | `package.json` | Existia desde Sprint 02 | — | Sem alteração |
| Exclusões de coverage | `vitest.config.ts` | Exclusões da Sprint 02 | — | Sem exclusão nova |
| Baseline JSON | `coverage/coverage-summary.json` | Gerado na Sprint 02 | — | Auditado e confirmado |

## Estado após a sprint

| Item | Estado |
|---|---|
| `coverage.thresholds` | ✅ `stmts: 25, branches: 20, funcs: 25, lines: 25` |
| Job `coverage` em CI | ✅ Adicionado com `timeout-minutes: 20` |
| Threshold acima do baseline | ✅ NÃO — conservador e abaixo |
| Exclusões novas | ✅ NENHUMA — exclusões mantidas idênticas às da Sprint 02 |
