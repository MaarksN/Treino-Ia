# P9 — Risk Register

| Risco | Severidade | Status | Mitigação nesta fase | Próxima ação |
|---|---|---|---|---|
| provider externo ausente | Média | Aberto | Plano de alertas/documentação criado sem dependência externa. | Aprovar provider e configurar ingestão/alerta real. |
| alertas reais não configurados | Alta | Aberto | Condições/limiares/owners definidos em `alerting-plan.md`. | Implementar regras no provider aprovado. |
| dashboard real ausente | Média | Aberto | Matriz de sinais e runbook definidos. | Criar dashboard operacional na fase seguinte. |
| E2E browser ausente | Alta | Aberto | Mantido como risco explícito. | Executar P10 com Playwright aprovado. |
| coverage ausente | Média | Aberto | Mantido como risco explícito. | Definir provider/estratégia de coverage em P10. |
| OAuth real pendente | Alta | Aberto | Fluxo revisado documentalmente e sinais definidos. | Rodar smoke OAuth real em ambiente seguro. |
| billing sandbox pendente | Alta | Aberto | Guardrails avaliados e alerta recomendado. | Executar smoke sandbox com evidência. |
| PWA offline pendente | Média | Aberto | Sinal de cache violation incluído. | Realizar smoke browser offline controlado. |
| rollback rehearsal pendente | Alta | Aberto | Runbook de incidente inclui validação de rollback. | Executar rehearsal com cronometria e evidência. |
