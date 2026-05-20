# Rollback Rehearsal (Não destrutivo)

- **Commit atual:** `01de6d8`
- **Commit anterior seguro (referência):** `b61cece`
- **Comando de rollback (não executado):** `git reset --hard b61cece` (local) ou `git revert 01de6d8` (histórico compartilhado).
- **Validação pós-rollback:** executar `npm run lint && npm run typecheck && npm test && npm run build` e smoke mínimo de autenticação/billing.
- **Critério para abortar release:** falha crítica em OAuth guard, billing guard, telemetry redaction, CSP bootstrap, ou build quebrado.
- **Responsável por aprovar rollback:** owner técnico + responsável de release.
- **Tempo máximo aceitável:** 30 minutos para restaurar estado estável com checks verdes.

> Observação: rollback destrutivo não foi executado nesta fase por restrição de autorização/escopo.
