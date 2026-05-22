# Risk Register - Sprint 06

| Risco | Severidade | Status anterior | Status apos sprint | Evidencia | Proxima acao |
|---|---|---|---|---|---|
| `/api/*` cache | Alta | Parcial por teste/static review na Sprint 05 | Mitigado por teste/static; browser direto bloqueado | `cachePolicy.test.ts`, `pwaServiceWorkerStatic.test.ts`, `public/sw.js` | Reexecutar em browser que exponha CacheStorage. |
| Authorization cache | Alta | Parcial por teste/static review na Sprint 05 | Mitigado por teste/static; browser direto bloqueado | Testes de `Authorization`/`authorization`; static test de `hasAuthorizationHeader()` | Reexecutar request auth controlado com CacheStorage observavel. |
| CacheStorage sensitive data | Alta | Aberto/parcial | Reduzido; sem evidencia de API/auth cacheada; risco residual para rotas futuras fora de `/api/*` | Static review do SW e offline fallback | Manter gate de policy para qualquer rota sensivel nova. |
| Offline fallback | Media | PWA offline pendente em P12/Sprint 05 | Static review PASS; offline browser real pendente | `offline-fallback-review.md`, `pwaServiceWorkerStatic.test.ts` | Smoke offline real em ambiente browser completo. |
| Service worker browser smoke parcial | Media | Aberto | Ainda parcial por limitacao da automacao | Browser probe: `navigator`, `window.navigator`, `caches`, `window.caches` undefined | Usar browser/Playwright autorizado com SW/CacheStorage expostos. |
| E2E/Coverage bloqueados | Media | Aceito no Sprint 01 | Inalterado; fora do escopo | `package.json` sem `test:e2e`/coverage operacional nesta sprint | Tratar em sprint propria, sem falso E2E/coverage. |
| OAuth/Billing sandbox pendentes | Media | Parcial/pendente apos Sprint 04 | Inalterado; fora do escopo | Sprint 04 final report e risk acceptance | Provisionar sandbox autorizado. |
| `style-src 'unsafe-inline'` | Media | Warning da Sprint 05 | Inalterado; fora do escopo | `vercel.json`, `tests/cspHeaders.test.ts` | Planejar CSP style-src strict mode. |
| Rollback real de deploy | Media | Rehearsal local/documental fechado; deploy real pendente | Inalterado; fora do escopo | Sprint 03 evidence | Executar em janela autorizada de release/provider. |
