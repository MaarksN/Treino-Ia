# P11 Sandbox Integration Smoke — Evidence

1. **Objetivo.** Validar integrações e comportamentos críticos em ambiente controlado/sandbox sem usar produção real e sem expor secrets.
2. **Base auditada.** Branch `work`, commit base `01de6d8`; artefatos P8 e P9 encontrados, P10 não encontrado.
3. **Ambiente usado.** Execução local no repositório; sem remote configurado; sem credenciais OAuth/Stripe sandbox.
4. **Smokes executados.** Auditoria OAuth, Billing, PWA, Telemetry, AI fallback, CSP, rollback rehearsal documental e health/readiness parcial.
5. **Smokes não executados e motivo.** OAuth real, billing sandbox real e browser offline/CSP completos bloqueados por ausência de credenciais/scripts E2E browser.
6. **Comandos executados.**
   - `git status --short`
   - `git branch --show-current`
   - `git log --oneline -10`
   - `git remote -v`
   - `git diff --check`
   - `npm run lint`
   - `npm run typecheck`
   - `npm test`
   - `npm run build`
   - `node -e "const s=require('./package.json').scripts||{}; ..."`
   - `rg -n "stripe|billing|checkout|payment|subscription|price" src api`
7. **Resultado real dos comandos.** lint/typecheck/test/build passaram; sem scripts `test:e2e` e `test:coverage`; remote inexistente.
8. **Riscos remanescentes.** OAuth/Billing sandbox pendentes, PWA browser parcial, provider observability ausente, rollback não destrutivo pendente, CSP com `unsafe-inline/unsafe-eval`.
9. **Decisão final.** GO WITH WARNINGS para avançar condicionalmente ao P12 apenas após tratar bloqueios críticos de sandbox.
