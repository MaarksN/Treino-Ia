# Risk Acceptance (P12)

| Risco | Severidade | Aceito? | Condição | Owner | Prazo |
|---|---|---|---|---|---|
| `unsafe-inline`/`unsafe-eval` ainda presente na CSP | Média | Sim | Mitigar em sprint dedicada com nonce/hash + E2E browser | Security + Frontend | 2026-06-15 |
| OAuth smoke real pendente | Média | Sim | Executar smoke autorizado antes de liberar OAuth produção | Backend + Security | 2026-06-10 |
| Billing sandbox pendente | Média | Sim | Realizar fluxo de cobrança em sandbox com evidência | Backend + QA | 2026-06-10 |
| PWA offline pendente | Baixa | Sim | Executar matriz de testes offline/controlar cache | Frontend + QA | 2026-06-20 |
| Observability provider real ausente | Média | Sim | Conectar provider, alertas e dashboard antes de scale-out | SRE/Platform | 2026-06-12 |
| Rollback rehearsal pendente | Média | Sim | Realizar rehearsal controlado em janela de release | Release Manager | 2026-06-08 |
| Coverage baixo/ausente em gate operacional | Média | Sim | Introduzir script coverage e baseline mínimo aprovado | QA Lead | 2026-06-18 |
| E2E parcial (sem script operacional no repo) | Média | Sim | Publicar suíte E2E mínima gateável no CI | QA + Frontend | 2026-06-18 |
