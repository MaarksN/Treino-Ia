# Risk Register — Controlled Technical Sprint 05

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 05 — React Component Test Harness Foundation

---

## Registro de riscos

| Risco | Severidade | Status anterior | Status após sprint | Mitigação | Próxima ação |
|---|---|---|---|---|---|
| **Harness React ausente** | Alto | ❌ Sem setup, sem render tests | ✅ RESOLVIDO — setup.ts + 2 component tests | `src/test/setup.ts` com jest-dom matchers; padrão documentado | Expandir para mais componentes |
| **Componentes grandes sem teste** | Alto | 80+ componentes com 0% render coverage | 🟡 ATIVO — 2 testados, 78+ restam | Fundação criada; padrão replicável | Sprint 06: coverage expansion |
| **jsdom/happy-dom incompatível** | Médio | Não verificado | ✅ VERIFICADO — jsdom funciona | Vitest + jsdom v29 + @testing-library/react v16 compatíveis | Monitorar se APIs de browser falharem |
| **Coverage threshold** | Médio | 26.06/22.71/26.04/25.83 | ✅ PRESERVADO ou MELHORADO | Novos component tests cobrem BottomNav + OnboardingTour | Monitorar aumento |
| **E2E flakiness** | Baixo | 16/16 PASS | ✅ PRESERVADO | Nenhuma alteração em specs E2E | Monitorar |
| **Seletores frágeis em component tests** | Baixo | N/A | ✅ MITIGADO — seletores acessíveis | Uso de `getByRole`, `getByText`, `getByPlaceholder` em vez de CSS | Manter padrão |
| **@testing-library/user-event ausente** | Baixo | Não instalada | 🟡 MONITORAR | `fireEvent` suficiente para fundação; user-event para typing/focus | Instalar quando necessário |
| **Dashboard/workout/recovery** | Alto | Sem component test | 🔴 ATIVO — escopo futuro | Requerem mock de DatabaseService ou estado complexo | Sprint 06+ |
| **React hooks/stores** | Médio | Sem teste | 🔴 ATIVO — escopo futuro | Hooks testáveis com `renderHook`; stores com mocks | Sprint 06+ |
| **Visual regression** | Baixo | Sem ferramenta | 🔴 FORA DO ESCOPO | Requer Storybook + Chromatic ou similar | Sprint futura |

---

## Evolução de riscos

| Sprint | Harness React | Componentes testados | jsdom | Coverage | E2E | Dashboard |
|---|---|---|---|---|---|---|
| Sprint 02 | ❌ Ausente | 0 | Não verificado | Sem gate | 4 tests | ❌ |
| Sprint 03 | ❌ Ausente | 0 | Não verificado | ✅ Gate ativo | 4 tests | ❌ |
| Sprint 04 | ❌ Ausente | 0 | Não verificado | ✅ Preservado | 16 tests | ❌ |
| **Sprint 05** | ✅ **Criado** | **2** | ✅ **Verificado** | ✅ **Preservado** | ✅ **16 tests** | 🔴 |
