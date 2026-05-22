# Track Decision — Controlled Technical Sprint 02

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 02 — Playwright/Coverage Registry Allowlist

## Verificação de registry

| Dependência | Comando | Resultado |
|---|---|---|
| `@playwright/test` | `npm view @playwright/test version` | ✅ `1.60.0` — LIBERADA |
| `@vitest/coverage-v8` | `npm view @vitest/coverage-v8 version` | ✅ `4.1.7` — LIBERADA |
| Chromium browser | `npx playwright install chromium` | ✅ Instalado em `%LOCALAPPDATA%\ms-playwright\chromium-1223` |

## Tabela de decisão

| Trilha | Dependência liberada? | Implementável agora? | Decisão | Motivo |
|---|---|---|---|---|
| Playwright E2E | ✅ Sim — `@playwright/test@1.60.0` | ✅ Sim — Chromium instalado, browser headless disponível | **IMPLEMENTAR** | Prioridade 1 conforme critério: browser CI suportado |
| Vitest Coverage | ✅ Sim — `@vitest/coverage-v8@4.1.7` | ✅ Sim — provider instalado, sem dependência de browser | **IMPLEMENTAR** | Prioridade 2 — ambas liberadas, ambas implementadas |

## Decisão final

**Trilha escolhida: AMBAS** — Playwright E2E (principal) + Vitest Coverage (complementar)

**Motivo:** Ambas as dependências estão disponíveis sem restrição de registry, sem erro de auth/proxy/403. O CI já tem infraestrutura para E2E (job `e2e` com skip honesto). O ambiente local suporta browser headless. Coverage é zero-risco pois usa mesmo runner vitest já em uso.

## Arquivos criados

| Arquivo | Tipo | Propósito |
|---|---|---|
| `playwright.config.ts` | Config | Playwright mínimo — Chromium headless, preview server porta 4173 |
| `tests/e2e/app-smoke.spec.ts` | Spec | Smoke: 200 OK, title, #root renderiza, sem erros críticos |
| `vitest.config.ts` (modificado) | Config | Adicionado `coverage.provider: v8`, excluídos specs E2E |
| `package.json` (modificado) | Scripts | `test:e2e`, `test:coverage` adicionados |
