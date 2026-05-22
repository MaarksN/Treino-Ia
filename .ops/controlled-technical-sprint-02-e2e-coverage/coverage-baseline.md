# Coverage Baseline — Controlled Technical Sprint 02

**Data:** 2026-05-22  
**Runner:** Vitest v4.1.7 com @vitest/coverage-v8 v4.1.7  
**Provider:** V8  
**Test Files:** 150 passed  
**Tests:** 578 passed

## Baseline global (todos os arquivos)

| Métrica | Valor |
|---|---|
| Statements | **26.06%** |
| Branches | **22.71%** |
| Functions | **26.04%** |
| Lines | **25.83%** |

> **Nota:** O baseline baixo é esperado. A maioria dos componentes React (`.tsx`) e serviços de UI não são exercitados por testes unitários — eles requerem renderização de browser. Os testes existentes cobrem principalmente serviços de negócio, utils e API handlers.

## Áreas com cobertura alta (acima de 80%)

| Área | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| `src/core/blocks` (bloco01–bloco20) | 100% | 80% | 100% | 100% |
| `src/services/biohacking` | 97.22% | 96.77% | 100% | 100% |
| `src/services/data` | 95.91% | 83.78% | 100% | 95.34% |
| `src/services/accessibility` | 91.12% | 84.21% | 92.5% | 93.57% |
| `src/services/gamification` | 90.9% | 77.27% | 100% | 100% |
| `src/services/advancedSocial` | 100% | 100% | 100% | 100% |
| `src/services/nutrition` | 97.14% | 92.85% | 100% | 96.77% |
| `src/services/ai` | 86.51% | 66.66% | 100% | 88.31% |
| `api/_lib` | 72.66% | 64.88% | 82.27% | 73.36% |
| `src/services/partners` | 100% | 100% | 100% | 100% |
| `src/services/monetization` | 100% | 100% | 100% | 100% |

## Áreas sem cobertura (0% ou próximo)

| Área | Motivo |
|---|---|
| `src/components/**/*.tsx` | Componentes React sem testes de renderização |
| `src/pages/**/*.tsx` | Pages React sem testes de renderização |
| `src/hooks/**` | Hooks React sem test harness de renderização |
| `src/stores/**` | Zustand stores sem test harness |
| `api/health/oauth/**` | Endpoints OAuth — requerem ambiente real |
| `api/retention/**` | Worker de retenção — sem teste unitário ainda |
| `src/utils/analyticsUtils.ts` | Sem teste unitário |
| `src/config/plans.ts` | Sem teste unitário |

## Arquivos excluídos do coverage

| Arquivo | Motivo |
|---|---|
| `src/main.tsx` | Entry point React — sem lógica testável isoladamente |
| `src/vite-env.d.ts` | Declaração de tipos — sem código executável |
| `src/**/*.test.ts(x)` | Próprios arquivos de teste |
| `tests/**` | Diretório de testes |
| `node_modules/**` | Dependências externas |

## Thresholds

Nenhum threshold definido nesta sprint baseline. O objetivo é capturar o estado atual sem bloquear o CI.

**Próxima ação (Sprint 03):** Definir threshold conservador (ex: statements ≥ 25%, branches ≥ 20%) e aumentar progressivamente.

## Relatórios gerados

| Formato | Local |
|---|---|
| Text (console) | STDOUT da execução |
| LCOV | `coverage/lcov.info` |
| JSON Summary | `coverage/coverage-summary.json` |
