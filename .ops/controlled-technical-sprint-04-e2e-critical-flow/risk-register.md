# Risk Register — Controlled Technical Sprint 04

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 04 — E2E Critical Flow Expansion

---

## Registro de riscos

| Risco | Severidade | Status anterior | Status após sprint | Mitigação | Próxima ação |
|---|---|---|---|---|---|
| **E2E flakiness** | Alto | N/A — apenas 4 testes smoke | ✅ MITIGADO — 16 testes estáveis, zero flaky | Seletores estáveis (text, role, CSS class); timeouts explícitos; localStorage isolado | Monitorar em CI por 3+ runs |
| **Seletores frágeis** | Médio | N/A | ✅ MITIGADO | Seletores usam texto visível (`getByText`, `getByRole`, `getByPlaceholder`) em vez de CSS instável | Se frágeis surgirem, adicionar data-testid |
| **Dependência externa** | Alto | Filtro inline duplicado | ✅ MITIGADO — helper centralizado | `helpers/console.ts` centraliza filtros benignos; patterns explícitos; nenhum genérico | Revisar patterns quando novas libs forem adicionadas |
| **OAuth/Billing real** | Alto | Pendente | 🔴 FORA DO ESCOPO | — | Sprint 05+ se secrets disponíveis |
| **Coverage threshold** | Médio | 25/20/25/25 | ✅ MANTIDO — 26.06/22.71/26.04/25.83 | Nenhuma mudança em vitest.config.ts; threshold preservado | Aumentar progressivamente +5% |
| **CI runtime E2E** | Médio | ~17s (4 testes) | 🟡 MONITORAR — ~27s (16 testes) | +10s para +12 testes; crescimento linear aceitável | Monitorar se passar de 60s |
| **Dashboard/workout sem E2E** | Médio | Sem E2E | 🟡 ATIVO — requer mock de DatabaseService | Fluxos condicionais (profile+plan) precisam de harness de estado | Sprint futura com React component test harness |
| **Componentes React sem cobertura unit** | Médio | 0% | 🟡 ATIVO — fora do escopo | Requer react-testing-library ou similar | Sprint futura dedicada |
| **Filtro de erros benignos amplo demais** | Baixo | Inline duplicado | ✅ MELHORADO — centralizado com patterns explícitos | Cada pattern é string literal, não regex genérico; `html2canvas` e `manifest.webmanifest` adicionados conforme observado | Auditoria periódica |

---

## Evolução de riscos

| Sprint | E2E flakiness | Seletores | Dependência ext. | OAuth/Billing | Coverage | CI runtime |
|---|---|---|---|---|---|---|
| Sprint 02 | N/A | N/A | Inline | 🔴 | Sem gate | ~17s |
| Sprint 03 | N/A | N/A | Inline | 🔴 | ✅ Gate ativo | ~17s |
| **Sprint 04** | ✅ **0 flaky** | ✅ **Text/role** | ✅ **Centralizado** | 🔴 | ✅ **Preservado** | 🟡 **~27s** |
