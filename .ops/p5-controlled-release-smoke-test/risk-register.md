# P5 Risk Register

| Risco | Estado | Impacto | Mitigação recomendada |
|---|---|---|---|
| OAuth real | Aberto | Alto | Executar smoke autorizado com credenciais de ambiente de teste |
| Billing sandbox | Aberto | Alto | Validar fluxo completo em sandbox Stripe sem cobrança real |
| PWA offline | Aberto | Médio | Executar teste de cache/offline em browser com DevTools |
| Observability | Aberto | Alto | Confirmar redaction PII, 500 genérico e correlação em logs reais |
| Rollback rehearsal | Aberto | Alto | Ensaiar rollback fim-a-fim e smoke pós-rollback |
| E2E browser | Aberto | Médio | Consolidar suíte Playwright mínima para fluxos críticos |
| Coverage | Aberto | Médio | Publicar percentual de cobertura e thresholds mínimos |
| CSP | Aberto | Alto | Auditar e endurecer CSP final por ambiente |
