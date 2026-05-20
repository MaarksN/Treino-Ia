# P8 — Risk Register

| Risco | Severidade | Status | Mitigação nesta fase | Próxima ação |
|---|---|---|---|---|
| `unsafe-inline`/`unsafe-eval` ainda presentes em `script-src` | Alta | Aberto | Não removido sem validação browser ampla | Planejar remoção faseada com smoke browser/E2E |
| E2E browser ausente | Alta | Aberto | Não expandido escopo | Habilitar Playwright quando aprovado |
| Coverage percentual ausente | Média | Aberto | Não expandido escopo | Definir gate de coverage em próxima fase |
| OAuth real pendente | Alta | Aberto | Não executado sem credenciais autorizadas | Rodar smoke OAuth em staging autorizado |
| Billing sandbox pendente | Alta | Aberto | Não executado sem chaves sandbox | Executar smoke sandbox controlado |
| PWA/offline smoke browser pendente | Média | Aberto | Apenas validação estática/build | Rodar smoke offline em browser real |
| Observability provider real pendente | Alta | Aberto | Sem provider externo novo | Aprovar provider e executar checklist operacional |
| Rollback rehearsal pendente | Alta | Aberto | Não alterado nesta fase | Executar ensaio controlado com runbook |
