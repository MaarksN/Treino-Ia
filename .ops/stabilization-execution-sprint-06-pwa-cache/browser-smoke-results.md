# Browser Smoke Results - Sprint 06

| Smoke | Executado? | Resultado | Evidencia | Observacao |
|---|---|---|---|---|
| `npm run build` pre-smoke | Sim | PASS | Vite build: 1970 modules transformed; `dist/index.html` e assets versionados gerados. | Warning conhecido: empty chunk `motion`. |
| `npm run preview` | Sim | PASS | Preview local respondeu `HTTP 200` em `http://127.0.0.1:4173/`. | Processo encerrado apos smoke. |
| App carrega | Sim | PASS | Browser abriu `http://127.0.0.1:4173/`, titulo `Treino Inteligente`, `#root` com conteudo (`rootTextLength=593`). | Console errors/warnings: `[]`. |
| Service worker | Parcial | BLOCKED/PARTIAL | Probe no browser: `typeof navigator === "undefined"` e `typeof window.navigator === "undefined"`. | Nao foi possivel observar `navigator.serviceWorker` pela automacao. |
| CacheStorage | Parcial | BLOCKED/PARTIAL | Probe no browser: `typeof caches === "undefined"` e `typeof window.caches === "undefined"`. | Nao foi possivel executar `caches.keys()` no browser. |
| Static assets | Sim | PASS/PARTIAL | `pageAssets`: 11 assets observados, incluindo 6 scripts, 2 stylesheets e 3 fonts; assets locais em `/assets/*.js` e `/assets/*.css`. | Carregamento real validado; entradas em CacheStorage nao inspecionadas. |
| `/api/*` nao entra no cache | Nao diretamente | PASS (TEST/STATIC), BROWSER BLOCKED | `src/services/pwa/cachePolicy.test.ts` cobre `/api/user` e `/api/gamification/event`; `tests/pwaServiceWorkerStatic.test.ts` cobre `networkOnly()` sem `cache.put`. | Sem PASS browser por falta de CacheStorage. |
| Authorization nao entra no cache | Nao diretamente | PASS (TEST/STATIC), BROWSER BLOCKED | Testes cobrem `Authorization` e `authorization`; static test confirma `hasAuthorizationHeader(request)`. | Sem request auth real em CacheStorage. |
| Offline fallback | Nao diretamente | PASS (STATIC), BROWSER BLOCKED | Static test cobre fallback API `503`, `cache-control: no-store` e `offline.html` sem marcadores sensiveis. | Offline browser real segue pendente. |

## Verdict

`PASS WITH WARNINGS`.

O app e os assets carregaram no preview real. A automacao de browser nao expos `navigator.serviceWorker` nem `CacheStorage`, entao o comportamento PWA/cache foi fechado por teste e static review, com bloqueio browser documentado.
