# Current State — Controlled Technical Sprint 05

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 05 — React Component Test Harness Foundation  
**Base:** Commit f17a14d — Expand critical E2E flow coverage

---

## Estado antes da sprint

| Área | Arquivo | Estado atual | Risco | Ação nesta sprint |
|---|---|---|---|---|
| React test libs | `package.json` | `@testing-library/react` v16.3.2, `@testing-library/jest-dom` v6.9.1, `jsdom` v29.1.1 instalados | Libs presentes mas não usadas para render | Reutilizar — sem nova dependência |
| Vitest config | `vitest.config.ts` | `environment: 'jsdom'`, `globals: true`, sem `setupFiles` | jest-dom matchers não disponíveis globalmente | Adicionar `setupFiles` |
| Setup file | — | Não existe | jest-dom matchers indisponíveis em testes | Criar `src/test/setup.ts` |
| Existing `.test.tsx` | 4 arquivos | Testam dados/services, NÃO renderizam componentes | 0% coverage de componentes React | Criar primeiros testes reais de render |
| BottomNav | `src/components/BottomNav.tsx` | 63 lines, presentacional, sem teste | Sem cobertura | Criar `BottomNav.test.tsx` |
| OnboardingTour | `src/components/OnboardingTour.tsx` | 116 lines, useState local, sem teste | Sem cobertura | Criar `OnboardingTour.test.tsx` |
| E2E | 4 specs, 16 tests | Estável | — | Preservar |
| Coverage | 26.06/22.71/26.04/25.83 | Thresholds: 25/20/25/25 | — | Preservar |

---

## Estado após a sprint

| Área | Arquivo | Estado após | Observação |
|---|---|---|---|
| Vitest config | `vitest.config.ts` | `setupFiles: ['./src/test/setup.ts']` adicionado | jest-dom matchers globais |
| Setup file | `src/test/setup.ts` | **NOVO** — importa `@testing-library/jest-dom/vitest` | Fundação para todos os component tests |
| BottomNav test | `src/components/BottomNav.test.tsx` | **NOVO** — 6 testes reais com render/interaction | Primeiro component test real |
| OnboardingTour test | `src/components/OnboardingTour.test.tsx` | **NOVO** — 7 testes reais com render/interaction | Segundo component test real |
| Unit tests | 152 files, 591 tests | +2 files, +13 tests (de 150/578) | Todos passando |
| E2E | 16/16 PASS | Preservado | Sem alteração |
| Coverage | Pendente | Preservado | Thresholds mantidos |
