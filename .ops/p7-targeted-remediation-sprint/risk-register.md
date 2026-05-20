| Risco | Severidade | Status | Mitigação nesta fase | Próxima ação |
|---|---|---|---|---|
| CSP ainda relaxada (`unsafe-inline`/`unsafe-eval`) | Alta | Aberto | Auditoria e plano de hardening progressivo | P8: CSP final com smoke browser e validação de regressão |
| E2E browser ausente/parcial | Alta | Aberto | Sem expansão de escopo/dependência nesta sprint | Aprovar Playwright/infra e executar suíte mínima crítica |
| Coverage percentual consolidado ausente | Média | Aberto | Documentado como bloqueio operacional | Definir provider e plano de cobertura no próximo ciclo |
| OAuth smoke real pendente | Média | Aberto | Mantido bloqueio por credenciais/autorização | Executar smoke autorizado em ambiente dedicado |
| Billing sandbox smoke pendente | Alta | Aberto | Mantido bloqueio por chaves sandbox | Provisionar chaves e validar webhook sandbox |
| PWA/offline browser smoke pendente | Média | Aberto | Revisão documental de cache policy/SW | Rodar smoke offline em browser com rede controlada |
| Observability provider externo pendente | Média | Aberto | Checklist e triagem local sem provider | Aprovar stack e implantar alertas/integração real |
| Rollback rehearsal pendente | Média | Aberto | Runbook mantido e referência para execução | Ensaiar rollback em ambiente controlado e capturar tempo |
