# P9 — Health / Readiness Review

| Check | Existe? | O que valida | Risco | Próxima ação |
|---|---|---|---|---|
| `GET /api/health` | Não identificado | N/A | Falta de heartbeat padrão para monitor externo. | Recomendar implementação P10 sem acoplar segredos. |
| `GET /api/ready` | Não identificado | N/A | Sem checagem explícita de dependências críticas antes de tráfego. | Recomendar implementação P10 com checagem mínima de env/deps. |
| `GET /api/version` | Não identificado | N/A | Dificulta correlação release/incidente. | Recomendar endpoint com commit SHA/build time em P10. |
| `POST /api/health/oauth/start` | Sim | Início de fluxo OAuth e persistência de state | Falha de dependência DB/credencial sem health padronizado. | Monitorar erro 5xx dessa rota como sinal crítico. |
| `GET /api/health/oauth/callback` | Sim | Conclusão OAuth/token storage | Falhas de callback impactam integração crítica. | Alertar por limiar de falhas e registrar triagem no runbook. |
| `POST /api/health/sync` | Sim | Disparo/sincronização health provider | Sem readiness formal para filas/deps. | Incluir em smoke operacional manual enquanto não há `/ready`. |
