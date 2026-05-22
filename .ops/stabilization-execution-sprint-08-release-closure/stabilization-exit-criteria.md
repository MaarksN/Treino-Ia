# Stabilization Exit Criteria - Sprint 08

| Criterio | Status | Evidencia | Pode considerar fechado? | Observacao |
|---|---|---|---|---|
| lint/typecheck/test/build verdes | CLOSED | Sprint 08 validacao inicial e final: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` | Sim | Build mantem warning conhecido de empty chunk `motion`, sem falha |
| CI e2e nao quebra por script ausente | CLOSED | Commit `0764422 ci: skip e2e when Playwright is unavailable`; Sprint 01 | Sim | E2E real continua bloqueado |
| Observability interna segura | REDUCED | Sprint 02 adapter interno/no-op externo, redaction ampliada e testes | Parcial | Provider externo, dashboard e alertas reais pendentes |
| Rollback dry-run documentado | REDUCED | Sprint 03 dry-run operacional e risk register | Parcial | Rollback em provider/staging ainda pendente |
| OAuth/Billing sem execucao nao autorizada | CLOSED | Sprint 04 `BLOCKED WITH EVIDENCE`; nenhum OAuth/Billing real executado sem sandbox | Sim | Smokes reais ainda pendentes por ambiente/secrets |
| CSP script-src endurecido | CLOSED | Sprint 05 removeu `unsafe-inline`/`unsafe-eval` de `script-src`; teste CSP e browser smoke | Sim | Manter teste de regressao |
| PWA/API cache mitigado por teste/static | REDUCED | Sprint 06 `cachePolicy.test.ts`, `pwaServiceWorkerStatic.test.ts` e static review | Parcial | SW/CacheStorage browser real pendente |
| style-src unsafe-inline aceito com plano | ACCEPTED RISK | Sprint 07 inline style audit, decision e migration plan | Sim como risco aceito | Nao declarar CSP strict final |
| E2E/Coverage aceitos como bloqueados | BLOCKED WITH EVIDENCE | Sprint 01 final report e risk register | Sim como risco aceito | Reabrir somente com registry/provider aprovado |
| Secrets nao commitados | CLOSED | Sprint 04 registrou ausencia de secrets e nenhuma sprint commitou valores sensiveis | Sim | Secrets devem ser configurados fora do repo |
| Sem migrations nao autorizadas | CLOSED | Sprints 01-08 nao criaram migrations Supabase | Sim | Mudancas de schema seguem fora do escopo |
| Sem produto/runtime alterado fora do escopo | CLOSED | Sprint 08 e Sprint 07 foram documentais; alteracoes anteriores ficaram escopadas | Sim | Sprint 08 nao alterou runtime |
