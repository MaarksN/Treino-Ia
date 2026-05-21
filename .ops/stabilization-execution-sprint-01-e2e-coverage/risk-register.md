| Risco | Severidade | Status | Mitigação nesta fase | Próxima ação |
|---|---|---|---|---|
| Playwright flakiness | Média | Aberto | Não aplicável; trilha não desbloqueada. | Após desbloqueio, habilitar retries/trace e estabilizar specs críticas. |
| Coverage threshold baixo | Média | Aberto | Não aplicar threshold fake sem provider real. | Rodar baseline real e definir threshold progressivo. |
| Browser install no CI | Média | Aberto | Apenas documentação técnica. | Validar `npx playwright install chromium` no runner oficial. |
| Registry 403 | Alta | Aberto | Evidência coletada e bloqueio formalizado. | Solicitar allowlist de `@playwright/test` e `@vitest/coverage-v8`. |
| Onboarding/session state | Média | Aberto | Sem novo fluxo implementado. | Cobrir com smoke E2E quando Playwright desbloquear. |
| OAuth real pendente | Média | Aberto | Fora de escopo mantido. | Executar smoke em ambiente autorizado. |
| Billing sandbox pendente | Média | Aberto | Fora de escopo mantido. | Executar smoke test-mode após provisionamento sandbox. |
| PWA offline pendente | Média | Aberto | Fora de escopo mantido. | Rodar browser smoke de cache/offline. |
| Observability provider pendente | Média | Aberto | Fora de escopo mantido. | Aprovar provider real (Sentry/PostHog/Datadog) e integrar. |
| Rollback rehearsal pendente | Alta | Aberto | Fora de escopo mantido. | Executar ensaio real de rollback em janela controlada. |
