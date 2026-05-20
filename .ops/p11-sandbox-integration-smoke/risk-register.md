# P11 Risk Register

| Risco | Severidade | Status | Mitigação nesta fase | Próxima ação |
|---|---|---|---|---|
| OAuth sem credencial sandbox | Alta | Aberto | Auditoria de guards e fluxo sem execução real | Provisionar credenciais sandbox e rodar smoke E2E OAuth |
| Billing sem chaves sandbox | Alta | Aberto | Auditoria de fluxo Stripe + erro seguro | Provisionar STRIPE test keys/preços de teste e executar smoke |
| PWA browser parcial | Média | Parcial | Auditoria SW/cache policy | Executar smoke browser offline com Playwright |
| Observability provider ausente | Média | Aberto | Mantido sem provider externo não aprovado | Aprovar provider e configurar alertas/dashboard reais |
| Rollback não executado destrutivamente | Média | Aberto | Rehearsal documental com comando/critério | Janela controlada para simulação prática autorizada |
| CSP com unsafe-inline/unsafe-eval | Média | Aberto | Registro explícito do risco + build smoke OK | Planejar remoção gradual com nonce/hash e validação E2E |
