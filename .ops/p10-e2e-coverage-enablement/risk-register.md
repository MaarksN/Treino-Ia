# P10 Risk Register

| Risco | Severidade | Status | Mitigação nesta fase | Próxima ação |
|---|---|---|---|---|
| Playwright flakiness | Média | Aberto | Não implementado por bloqueio de dependência; risco mantido explícito. | Após desbloqueio, iniciar smoke mínimo e observar taxa de flaky em CI. |
| Coverage threshold baixo | Média | Aberto | Não implementado por bloqueio de provider; evitado threshold artificial. | Definir baseline real e thresholds progressivos após habilitar provider. |
| Browser install no CI | Alta | Aberto | Evidência de impossibilidade de instalar pacotes browser neste ambiente. | Ajustar política de allowlist/cache de browser bins no CI. |
| Onboarding/session state | Média | Aberto | Mantido no registro para futura suíte E2E sem bypass não documentado. | Definir estratégia de estado de sessão para testes determinísticos. |
| OAuth real pendente | Alta | Aberto | Fora de escopo mantido. | Validar em P11 com credenciais autorizadas. |
| Billing sandbox pendente | Alta | Aberto | Fora de escopo mantido. | Validar em P11 com chaves sandbox e webhook controlado. |
| PWA offline pendente | Média | Aberto | Fora de escopo mantido. | Executar browser smoke offline em P11 após E2E habilitado. |
| Observability provider pendente | Alta | Aberto | Fora de escopo mantido sem provider externo. | Conectar provider aprovado em fase dedicada. |
| Rollback rehearsal pendente | Alta | Aberto | Fora de escopo mantido. | Executar rehearsal controlado com evidência operacional em P11+. |
