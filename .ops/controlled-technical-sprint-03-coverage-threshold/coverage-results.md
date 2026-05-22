# Coverage Results — Controlled Technical Sprint 03

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 03 — Coverage Threshold Definition  
**Comando:** `npm run test:coverage` (Vitest v4.1.7 + @vitest/coverage-v8 v4.1.7)  
**Test Files:** 150 passed | **Tests:** 578 passed | **Duration:** 64.21s

## Resultado com threshold ativo

| Métrica | Resultado atual | Threshold | Margem | Passou? |
|---|---:|---:|---:|---|
| Statements | **26.07%** | 25% | +1.07% | ✅ SIM |
| Branches | **22.71%** | 20% | +2.71% | ✅ SIM |
| Functions | **26.07%** | 25% | +1.07% | ✅ SIM |
| Lines | **25.84%** | 25% | +0.84% | ✅ SIM |

> **Nota:** Valores diferem ligeiramente do baseline JSON (26.06/22.71/26.04/25.83) por variação de 0.01-0.03% entre execuções — dentro do esperado para instrumentação V8.

## Resultado global: ✅ PASS

Nenhum threshold violado. Nenhum arquivo excluído para passar. Nenhum fake usado.

## Áreas com alta cobertura (> 80%) — mantidas

| Área | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| `src/core/blocks` (bloco01–bloco20) | 100% | 80% | 100% | 100% |
| `src/services/biohacking` | 97.22% | 96.77% | 100% | 100% |
| `src/services/data` | 95.91% | 83.78% | 100% | 95.34% |
| `src/services/accessibility` | 91.93% | 84.21% | 95% | 94.49% |
| `src/services/gamification` | 90.9% | 77.27% | 100% | 100% |
| `src/services/advancedSocial` | 100% | 100% | 100% | 100% |
| `src/services/nutrition` | 97.14% | 92.85% | 100% | 96.77% |
| `src/services/ai` | 86.51% | 66.66% | 100% | 88.31% |
| `src/services/partners` | 100% | 100% | 100% | 100% |
| `src/services/monetization` | 100% | 100% | 100% | 100% |

## Áreas sem cobertura (0%) — sem alteração, sem exclusão nova

| Área | Motivo (inalterado) |
|---|---|
| `src/components/**/*.tsx` | Componentes React — sem test harness de renderização |
| `src/pages/**/*.tsx` | Pages — sem test harness de renderização |
| `src/hooks/**` | Hooks React — sem test harness |
| `src/stores/**` | Zustand stores — sem test harness |
| `api/health/oauth/**` | Requerem ambiente OAuth real |
| `api/retention/worker.ts` | Sem teste unitário |

## Evolução de cobertura

| Métrica | Sprint 01 | Sprint 02 (baseline) | Sprint 03 (com threshold) |
|---|---|---|---|
| Statements | N/A | 26.06% | 26.07% |
| Branches | N/A | 22.71% | 22.71% |
| Functions | N/A | 26.04% | 26.07% |
| Lines | N/A | 25.83% | 25.84% |
