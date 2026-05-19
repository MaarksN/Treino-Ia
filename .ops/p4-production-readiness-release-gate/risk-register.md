# P4 Risk Register (Padrão)

| Risco | Severidade | Status | Mitigação | Próxima ação |
|---|---|---|---|---|
| CSP ainda relaxada (se aplicável ao ambiente) | Médio | Aberto | Revisar política CSP mínima segura por estágio | Validar headers em staging e produção |
| Playwright ausente/parcial | Médio | Aberto | Manter estratégia incremental de smoke E2E | Planejar cobertura E2E browser no próximo ciclo |
| Coverage percentual ausente no gate | Médio | Aberto | Definir baseline e publicar relatório estável em CI | Propor threshold progressivo |
| OAuth real por ambiente | Alto | Mitigado Parcial | Validar callback/start com credenciais de cada ambiente | Rodar smoke OAuth real em staging |
| Billing real por ambiente | Alto | Mitigado Parcial | Validar fluxo de cobrança sandbox/produção | Executar smoke billing com evidência |
| PWA/offline regressão | Médio | Aberto | Smoke offline e cache em release controlada | Executar checklist PWA pós-deploy |
| Observabilidade insuficiente | Alto | Aberto | Confirmar logs/alertas/dashboards | Aprovação SRE/DevOps antes do deploy |
| Rollback não ensaiado recentemente | Alto | Aberto | Seguir runbook de rollback | Simular rollback controlado |
| Dados sensíveis (segredos/env) | Alto | Mitigado Parcial | Checklist de segredos e rotação | Revisão final por segurança antes do GO |
| IA provider/custo | Médio | Aberto | Limites e monitoramento de consumo | Revisar orçamento e alertas de custo |
