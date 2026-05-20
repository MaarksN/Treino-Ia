# P5 Smoke Results

| Área | Resultado | Evidência | Observação |
|---|---|---|---|
| App boot | PASS (parcial) | `npm run build` OK | Sem browser integrado nesta execução; validação visual pendente |
| Dashboard | NOT EXECUTED | Sem execução browser | Requer smoke manual em preview/staging |
| Active Workout | NOT EXECUTED | Sem execução browser | Requer interação UI em browser |
| Recovery | NOT EXECUTED | Sem execução browser | Requer interação UI em browser |
| Nutrition | NOT EXECUTED | Sem execução browser | Requer interação UI em browser |
| IA | PASS (guardas indiretas) | `npm test` (552/552) + suíte existente | Sem smoke com backend IA real nesta execução |
| OAuth | PASS WITH WARNING | Base com correções prévias + `npm test`/`npm run build` | Sem credenciais reais/autorização para fluxo real |
| Billing | PASS WITH WARNING | Sem integração real executada | Apenas critério de não cobrança real preservado |
| PWA | NOT EXECUTED | Sem browser/network toggle | Requer teste offline/manual |
| Telemetry | NOT EXECUTED | Sem acesso a observabilidade do ambiente real | Requer validação em staging/prod logs |
| Music embed security | NOT EXECUTED | Sem browser | Validar em smoke visual controlado |
| Privacy panel | NOT EXECUTED | Sem browser | Validar em smoke visual controlado |
| Rollback | PASS (documental) | Checklists P4 existentes em `.ops/p4-production-readiness-release-gate` | Ensaio de rollback ainda pendente |
