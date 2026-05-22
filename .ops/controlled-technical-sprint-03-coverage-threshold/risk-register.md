# Risk Register — Controlled Technical Sprint 03

**Data:** 2026-05-22  
**Sprint:** Controlled Technical Sprint 03 — Coverage Threshold Definition

## Registro de riscos

| Risco | Severidade | Status anterior | Status após sprint | Mitigação | Próxima ação |
|---|---|---|---|---|---|
| **Threshold agressivo** | Alto | Sem threshold | ✅ MITIGADO — threshold conservador ~1-2% abaixo do baseline | Threshold baseado em baseline real auditado de Sprint 02 | Aumentar progressivamente +5% em futuros sprints |
| **Coverage falso** | Alto | — | ✅ NÃO OCORREU — gates reais | Provider v8 instrumenta código real; nenhum arquivo excluído sem justificativa | Monitorar se novas exclusões aparecerem em PRs |
| **Exclusões indevidas** | Alto | — | ✅ NÃO OCORREU — exclusões idênticas à Sprint 02 | Nenhuma exclusão nova adicionada | Auditoria de exclusões em Sprint 04+ |
| **CI lento por coverage** | Médio | CI sem job de coverage | 🟡 MONITORADO — job separado com 20min timeout | Job `coverage` paralelo ao job `e2e`; não bloqueia o job `build` | Monitorar tempo de CI; ajustar timeout se necessário |
| **Componentes React sem cobertura** | Médio | 0% componentes cobertos | 🟡 ATIVO — não é escopo desta sprint | Componentes requerem test harness de renderização (Storybook/react-testing-library) | Sprint futura dedicada a component tests |
| **Branches baixas** | Médio | 22.71% (baseline) | 🟡 ATIVO — threshold em 20% dá margem | Branches são voláteis; threshold conservador protege | Aumentar threshold de branches quando components forem testados |
| **OAuth sandbox** | Alto | Pendente | 🔴 FORA DO ESCOPO | — | Sprint 04+ se ambiente disponível |
| **Billing sandbox** | Alto | Pendente | 🔴 FORA DO ESCOPO | — | Sprint 04+ se ambiente disponível |
| **Threshold regredir por arquivo novo** | Médio | — | 🟡 MITIGADO com margem | Margem de ~1-2% absorve 1-2 arquivos sem cobertura | Avisar a equipe que arquivos novos podem drenar margem |

## Evolução de riscos

| Sprint | Threshold agressivo | Coverage falso | CI coverage | Componentes React |
|---|---|---|---|---|
| Sprint 01 | N/A | N/A | N/A | N/A |
| Sprint 02 | Sem threshold (sem risco) | ✅ Resolvido | Sem job CI | 🔴 Ativo |
| **Sprint 03** | ✅ **Mitigado** | ✅ **Não ocorreu** | ✅ **Job criado** | 🟡 **Monitorando** |
