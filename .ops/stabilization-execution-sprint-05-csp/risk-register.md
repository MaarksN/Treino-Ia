# Sprint 05 Risk Register

| Risco | Severidade | Status anterior | Status apos sprint | Evidencia | Proxima acao |
|---|---|---|---|---|---|
| `unsafe-inline` em `script-src` | Media | Aberto/aceito em P12 | Fechado para `script-src` | `vercel.json`, `tests/cspHeaders.test.ts`, browser smoke sob CSP real | Monitorar em preview/prod; manter teste. |
| `unsafe-eval` em `script-src` | Media | Aberto/aceito em P12 | Fechado para `script-src` | `vercel.json`, `tests/cspHeaders.test.ts`, browser smoke sob CSP real | Monitorar em preview/prod; manter teste. |
| `unsafe-inline` em `style-src` | Media | Aberto/aceito em P12 | Aberto com warning | `strict-mode-decision.md` | Planejar nonce/hash ou politica `style-src-elem`/`style-src-attr` com browser smoke visual amplo. |
| Browser smoke ausente | Media | Aberto desde P8/P12 | Parcialmente reduzido | `browser-smoke-results.md`: boot/dashboard sob CSP real PASS; embeds/cache parcialmente validados por testes | Executar smoke UI do MusicPlayer se ele for montado; executar CacheStorage smoke em browser com acesso a `navigator/caches`. |
| E2E/Coverage bloqueados | Media | Aceito em Sprint 01/P12 | Inalterado | `package.json` sem `test:e2e`/`test:coverage`; esta sprint nao reabriu escopo | Manter como risco aceito ate sprint propria. |
| OAuth/Billing sandbox pendentes | Alta | Sprint 04 fechada como `BLOCKED WITH EVIDENCE` | Inalterado | `.ops/stabilization-execution-sprint-04-oauth-billing/final-report.md` | Provisionar sandbox/secrets autorizados. |
| PWA offline smoke pendente | Baixa | Aberto em P12 | Parcialmente reduzido para cache policy; offline real ainda aberto | `cachePolicy.test.ts`, `public/sw.js`, browser cache inspection blocked | Sprint dedicada PWA Offline/Cache Browser Smoke. |
| Rollback real deploy pendente | Media | Sprint 03 reduziu por dry-run | Inalterado | `.ops/stabilization-execution-sprint-03-rollback/final-report.md` | Executar rehearsal em deploy provider/staging autorizado. |

## Risk Decision

Sprint 05 reduziu o risco CSP de scripts. O risco CSP nao esta totalmente fechado porque `style-src 'unsafe-inline'` permanece e parte do browser smoke ficou parcial por UI nao montada/limite de automacao.
