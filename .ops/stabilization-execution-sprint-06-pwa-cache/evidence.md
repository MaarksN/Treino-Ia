# Evidence - Stabilization Execution Sprint 06

## 1. Objetivo

Validar o comportamento PWA/offline/cache em ambiente controlado, sem criar feature nova e sem reabrir E2E/Coverage. O foco foi garantir que `/api/*` e requests com `Authorization` nao sejam cacheados, revisar fallback offline e documentar honestamente o que o browser smoke conseguiu ou nao executar.

## 2. Base auditada

| Item | Resultado |
|---|---|
| Branch | `main` |
| Top commit inicial | `7d10f58 Add CSP strict mode smoke evidence` |
| Remote | `origin https://github.com/MaarksN/Treino-Ia.git` |
| `git pull` | `Already up to date.` |
| Working tree inicial | Somente `?? .ops/pr-41-review/` pre-existente e preservado |

Historico confirmado na `main`:

| Marco | Evidencia |
|---|---|
| Sprint 05 CSP Strict Mode with Browser Smoke | `7d10f58 Add CSP strict mode smoke evidence` |
| Sprint 04 OAuth/Billing Sandbox Smoke | `18dedc3 Add OAuth and billing sandbox smoke evidence` |
| Sprint 03 Rollback Rehearsal | `7b1da6d Add rollback rehearsal evidence` e merge `2830e0c` |
| Sprint 02 Observability | `5c241f8 Add approved observability foundation` e merge `c8a201d` |
| Hotfix CI E2E skip honesto | `0764422 ci: skip e2e when Playwright is unavailable` |

## 3. PWA/cache atual

- `src/main.tsx` chama `registerSW()`.
- `src/utils/pwaUtils.ts` registra `/sw.js` quando `navigator.serviceWorker` existe.
- `public/sw.js` usa app shell cache (`treino-app-shell-v1`) e data cache (`treino-app-data-v1`).
- `public/sw.js` envia `/api/*` same-origin e requests com `Authorization` para `networkOnly()`.
- `networkOnly()` nao chama `caches.open()` nem `cache.put()`.
- Fallback API offline retorna `503` com `cache-control: no-store`.
- Assets estaticos same-origin podem usar `cacheFirst()` conforme policy.

## 4. Decisao de smoke browser

`BROWSER PWA CACHE SMOKE BLOCKED/PARTIAL`.

O preview e o boot foram executados em browser real, mas a superficie de automacao nao expos APIs necessarias para SW/CacheStorage:

- `typeof navigator === "undefined"`
- `typeof window.navigator === "undefined"`
- `typeof caches === "undefined"`
- `typeof window.caches === "undefined"`

Por isso, SW registration, CacheStorage, `/api` cache e Authorization cache nao foram declarados como PASS browser. A validacao desses pontos ficou em TEST/STATIC com evidencia.

## 5. Codigo/testes alterados

| Arquivo | Mudanca |
|---|---|
| `src/services/pwa/cachePolicy.test.ts` | Acrescentados casos para `authorization` lowercase via `Headers` e non-GET `network-only`. |
| `tests/pwaServiceWorkerStatic.test.ts` | Teste novo para bypass `/api/*`/Authorization, `networkOnly()` sem escrita em CacheStorage, fallback API `503 no-store` e offline HTML sem marcadores sensiveis. |

Nenhum arquivo de feature, schema, migration ou secret foi alterado.

## 6. Browser smoke executado ou bloqueado

| Item | Resultado |
|---|---|
| Preview HTTP | PASS, `HTTP 200` em `http://127.0.0.1:4173/` |
| App boot | PASS, titulo `Treino Inteligente`, `#root` com conteudo |
| Console | PASS, `[]` para errors/warnings |
| Assets observados | PASS/PARTIAL, `pageAssets` viu 11 assets: 6 scripts, 2 stylesheets, 3 fonts |
| Service worker | BLOCKED/PARTIAL, `navigator` indisponivel na automacao |
| CacheStorage | BLOCKED/PARTIAL, `caches` indisponivel na automacao |
| `/api/*` cache | PASS TEST/STATIC, browser direto bloqueado |
| Authorization cache | PASS TEST/STATIC, browser direto bloqueado |
| Offline fallback | PASS STATIC, browser offline real bloqueado |

## 7. Offline fallback review

`public/offline.html` e generico e nao contem token, bearer, authorization, password, CPF, sessao ou email de exemplo. Para `/api/*`, `networkOnly()` retorna erro `503` com `cache-control: no-store`, sem simular sucesso e sem recorrer a dado antigo de cache.

## 8. Comandos executados

```txt
git status --short
git branch --show-current
git log --oneline -20
git remote -v
git pull
git diff --check
npm run lint
npm run typecheck
npm test
npm run build
Select-String ... serviceWorker/cache/API patterns
rg -n "serviceWorker|navigator\\.serviceWorker|CacheStorage|caches|cachePolicy|shouldBypassCache|Authorization|/api/" ...
npm test -- src/services/pwa/cachePolicy.test.ts tests/pwaServiceWorkerStatic.test.ts
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
browser open/evaluate/pageAssets/log inspection
```

E2E NOT AVAILABLE / SKIPPED - risco ja aceito e tratado no Sprint 01.

## 9. Resultado real dos comandos

| Comando | Resultado |
|---|---|
| `git pull` | PASS, `Already up to date.` |
| `git diff --check` inicial | PASS |
| `npm run lint` inicial | PASS |
| `npm run typecheck` inicial | PASS |
| `npm test` inicial | PASS, 147 files / 564 tests |
| `npm run build` inicial | PASS, 1970 modules transformed |
| Teste PWA direcionado | PASS, 2 files / 11 tests |
| `npm run build` pre-smoke | PASS, 1970 modules transformed |
| `npm run preview` smoke | PASS, HTTP 200 |
| Browser app boot | PASS |
| Browser SW/CacheStorage | BLOCKED/PARTIAL por APIs nao expostas |
| `git diff --check` final | PASS, com warning de normalizacao CRLF em `cachePolicy.test.ts` |
| `npm run lint` final | PASS |
| `npm run typecheck` final | PASS |
| `npm test` final | PASS, 148 files / 570 tests |
| `npm run build` final | PASS, 1970 modules transformed |
| `git status --short` final pre-commit | Sprint 06 docs/testes alterados + `?? .ops/pr-41-review/` pre-existente |

## 10. Riscos remanescentes

- Service worker/CacheStorage ainda sem PASS browser direto.
- Offline browser real ainda pendente.
- E2E/Coverage continuam indisponiveis/skipped e fora desta sprint.
- OAuth/Billing sandbox continuam pendentes e fora desta sprint.
- `style-src 'unsafe-inline'` continua pendente e fora desta sprint.
- Rollback real de deploy provider continua pendente.

## 11. Proxima acao

Stabilization Execution Sprint 07 - Stripe/OAuth Sandbox Provisioning ou CSP Style-src Strict Plan, dependendo de ambiente autorizado. Para PWA, a proxima validacao ideal e repetir o smoke em browser automation que exponha `navigator.serviceWorker`, `CacheStorage` e controle offline real.
