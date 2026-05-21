# Stabilization Execution Sprint 02 - Risk Register

| Risco | Severidade | Status | Mitigacao nesta fase | Proxima acao |
|---|---|---|---|---|
| Provider externo ausente | Media | Aberto | Manual/Internal adapter criado sem envio externo. | Aprovar provider e configurar ingestao segura. |
| Alertas reais nao configurados | Alta | Aberto | Matriz de sinais e runbook atualizados. | Criar alertas no provider aprovado. |
| Dashboard real ausente | Media | Aberto | Sinais implementaveis documentados. | Criar dashboard operacional com acesso minimo. |
| CorrelationId ponta-a-ponta parcial | Media | Aberto | `requestId` preservado e `correlationId` previsto no contrato. | Padronizar propagation no API/frontend. |
| E2E/Coverage bloqueados | Alta | Aberto | Mantido fora do escopo; CI faz skip honesto para E2E ausente. | Liberar registry/coverage provider e reabrir trilha propria. |
| OAuth/Billing sandbox pendentes | Alta | Aberto | Runbook define verificacao segura sem secrets. | Provisionar sandbox autorizado e executar smoke. |
| Rollback rehearsal pendente | Alta | Aberto | Mantido como risco explicito. | Executar Sprint 03 rollback rehearsal real. |
| Redaction incompleta em provider futuro | Alta | Parcialmente mitigado | Redaction ampliada e coberta por testes de observability. | Revalidar antes de qualquer export externo. |
