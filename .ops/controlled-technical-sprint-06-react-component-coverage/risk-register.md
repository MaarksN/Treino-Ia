| Risco | Severidade | Status anterior | Status após sprint | Mitigação | Próxima ação |
|---|---|---|---|---|---|
| **Componentes grandes sem teste** | Alto | 78+ componentes com 0% render coverage | 🟡 ATIVO — 75+ restam | +3 componentes cobertos na Sprint 06 | Continuar expandindo coverage |
| **Dashboard/workout/recovery** | Alto | Sem component test | 🔴 ATIVO — escopo futuro | Requerem mock de DatabaseService ou estado complexo | Abordar em sprints futuras |
| **Browser API mocks** | Médio | N/A | ✅ MITIGADO | `navigator.onLine` e window events mockados localmente nos testes | Manter isolamento |
| **Coverage threshold** | Médio | 26.21/22.86/26.30/25.99 | ✅ MELHORADO | Subiu para 26.55/22.98/26.63/26.34 | Monitorar aumento |
| **E2E flakiness** | Baixo | 16/16 PASS | ✅ PRESERVADO | 16/16 PASS sem alterações nos specs | Monitorar |
| **Visual regression** | Baixo | Sem ferramenta | 🔴 FORA DO ESCOPO | Requer Storybook + Chromatic ou similar | Avaliar ferramenta no futuro |
