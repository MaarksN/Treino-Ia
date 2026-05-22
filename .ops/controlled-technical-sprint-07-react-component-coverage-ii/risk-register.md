| Risco | Severidade | Status anterior | Status após sprint | Mitigação | Próxima ação |
|---|---|---|---|---|---|
| **Componentes grandes sem teste** | Alto | 75+ componentes com 0% render coverage | 🟡 ATIVO — 72+ restam | +3 componentes cobertos na Sprint 07 | Continuar expandindo coverage progressivamente |
| **Dashboard/workout/recovery** | Alto | Sem component test | 🔴 ATIVO — escopo futuro | Requerem mock de DatabaseService ou estado complexo | Abordar em sprints futuras |
| **Integração de serviços** | Médio | N/A | ✅ MITIGADO | Mocks robustos para utilitários externos (ex: geminiService, themeUtils) aplicados localmente | Manter isolamento de teste |
| **Coverage threshold** | Médio | 26.55/22.98/26.63/26.34 | ✅ MELHORADO | Subiu para 26.89/23.29/26.92/26.72 | Monitorar aumento contínuo |
| **E2E flakiness** | Baixo | 16/16 PASS | ✅ PRESERVADO | 16/16 PASS sem alterações nos specs | Monitorar |
| **Visual regression** | Baixo | Sem ferramenta | 🔴 FORA DO ESCOPO | Requer infraestrutura adicional (Storybook/Chromatic) | Avaliar ferramenta no futuro |
