# Stabilization Execution Sprint 03 - Risk Register

| Risco | Severidade | Status anterior | Status apos sprint | Evidencia | Proxima acao |
|---|---|---|---|---|---|
| Rollback rehearsal real | Media | OPEN - not executed | REDUCED - dry-run operacional executado | `rehearsal-results.md` com checkout, validacao do commit seguro e retorno ao HEAD atual | Executar staging/preview ou provider rollback em janela autorizada |
| Ambiente staging/preview ausente | Media | OPEN | OPEN | `rehearsal-decision.md` documenta ausencia de URL/permissao | Provisionar ambiente autorizado e owner de deploy |
| Validacao pos-rollback parcial | Media | OPEN | OPEN - checklist criado, mas sem URL real | `post-rollback-validation-checklist.md` | Executar smoke em staging/preview ou producao autorizada |
| E2E/Coverage bloqueados | Media | OPEN - risco aceito no Sprint 01 | OPEN | `npm pkg get scripts` sem `test:e2e` ou `test:coverage` | Retomar somente quando registry/provider for aprovado |
| Observability provider externo ausente | Media | OPEN - Sprint 02 criou adapter interno | OPEN, com mitigacao parcial | `.ops/stabilization-execution-sprint-02-observability/final-report.md` | Aprovar provider externo e alertas reais antes de scale-out |
| OAuth/Billing sandbox pendentes | Media | OPEN | OPEN | P12 risk acceptance e post-launch risk burndown | Executar sandbox smokes autorizados |
| Tags/releases formais ausentes | Baixa | OPEN | OPEN | `git tag --list` sem saida | Criar politica de release tag apos proximo gate aprovado |
| Rollback destrutivo nao autorizado | Alta | Guardrail requerido | MITIGATED | Nenhum deploy/rollback real executado | Manter aprovacao explicita obrigatoria |
