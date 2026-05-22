# Current State — Controlled Technical Sprint 02

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 02 — Playwright/Coverage Registry Allowlist  
**Base:** Commit 1837620 (Minimize Stripe webhook persisted payload)

## Estado inicial dos scripts (antes da sprint)

| Script | Existia? |
|---|---|
| `test:e2e` | ❌ Não existia |
| `test:coverage` | ❌ Não existia |

## Estado do CI antes da sprint

| Arquivo | E2E | Skip honesto? |
|---|---|---|
| `.github/workflows/ci.yml` | Job `e2e` presente | ✅ Sim — `echo available=false` se `test:e2e` ausente |

## Tabela completa de estado

| Área | Arquivo | Estado atual | Risco | Ação nesta sprint |
|---|---|---|---|---|
| E2E / Playwright | `package.json` | `test:e2e` ausente antes da sprint | Alto — CI skip sempre | Criado script real `playwright test` |
| E2E / Playwright | `playwright.config.ts` | Não existia | Alto — sem config | Criado config mínimo real |
| E2E / Playwright | `tests/e2e/app-smoke.spec.ts` | Não existia | Alto — sem spec | Criado smoke spec real |
| Coverage | `package.json` | `test:coverage` ausente antes da sprint | Médio — sem baseline | Criado script real `vitest run --coverage` |
| Coverage | `vitest.config.ts` | Sem `coverage` block | Médio — sem provider | Adicionado `coverage.provider: v8` |
| Coverage | `@vitest/coverage-v8` | Não instalado | Médio — provider ausente | Instalado `^4.1.7` |
| Browser | `@playwright/test` | Não instalado | Alto — sem runner | Instalado `^1.60.0` |
| Browser | Chromium | Não instalado localmente | Alto — sem browser | Instalado via `npx playwright install chromium` |
| CI | `.github/workflows/ci.yml` | Skip honesto presente, condição correta | Baixo — skip correto | Skip honesto removido pois `test:e2e` agora existe |

## Scripts após a sprint

| Script | Comando real |
|---|---|
| `test:e2e` | `playwright test` |
| `test:coverage` | `vitest run --coverage` |
