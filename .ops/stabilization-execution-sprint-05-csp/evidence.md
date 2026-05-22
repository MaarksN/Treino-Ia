# Stabilization Execution Sprint 05 Evidence

## 1. Objetivo

Auditar a CSP atual, aplicar hardening incremental seguro e validar com build/browser smoke sem criar feature nova, sem migration, sem E2E falso e sem bloquear providers legitimos usados pelo app.

## 2. Base Auditada

- Branch: `main`.
- `git pull`: `Already up to date.`
- Historico confirmou:
  - Sprint 02 Observability: `c8a201d Merge pull request #97...`
  - Sprint 03 Rollback: `2830e0c Merge pull request #98...`
  - Sprint 04 OAuth/Billing: `18dedc3 Add OAuth and billing sandbox smoke evidence`
  - Hotfix E2E skip honesto: `0764422 ci: skip e2e when Playwright is unavailable`
- Worktree inicial: apenas `?? .ops/pr-41-review/`, preexistente e fora do escopo.

## 3. CSP Atual

Antes da Sprint 05, `vercel.json` continha:

- `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://html2canvas.hertzen.com`
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
- `connect-src` com Supabase, Gemini, Stripe API, PostHog e Sentry ingest.
- `frame-src` com Stripe, YouTube, YouTube-nocookie, Spotify e SoundCloud.
- `media-src 'self' blob:`
- `worker-src 'self' blob:`
- `object-src 'none'`
- `base-uri 'self'`
- `form-action 'self'`
- `frame-ancestors 'none'`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), bluetooth=()`

## 4. Decisao de Strict Mode

Aplicar strict mode parcial em scripts:

- Remover `unsafe-inline` de `script-src`.
- Remover `unsafe-eval` de `script-src`.
- Manter `style-src 'unsafe-inline'` por compatibilidade ate matriz visual/nonce/hash dedicada.
- Manter providers legitimos de Supabase/API/Gemini/Stripe/YouTube/Spotify/SoundCloud.
- Nao declarar CSP strict final.

## 5. Codigo/Config Alterado

- `vercel.json`: `script-src` agora e `'self' https://html2canvas.hertzen.com`.
- `tests/cspHeaders.test.ts`: novo teste para impedir regressao da CSP e preservar allowlists/diretivas criticas.

## 6. Testes Criados/Ajustados

Criado:

- `tests/cspHeaders.test.ts`

Executado targeted:

- `npx vitest run tests/cspHeaders.test.ts src/services/media/musicEmbedService.test.ts src/services/pwa/cachePolicy.test.ts`
- Resultado: PASS, 3 files e 14 tests.

## 7. Browser Smoke Executado ou Bloqueado

Executado:

- `npm run preview` em `http://127.0.0.1:4173/`, HTTP 200.
- Servidor local temporario com CSP real em `http://127.0.0.1:4174/`, HTTP 200 e header CSP presente.
- Browser smoke do app boot sob CSP real: PASS, sem console errors/warnings.
- Browser smoke da rota inicial/dashboard sob CSP real: PASS, sem console errors/warnings.

Parcial/bloqueado:

- Music embeds UI: o `MusicPlayer` esta exportado, mas nao montado em `App`/`Dashboard`; validacao ficou em teste/config.
- PWA CacheStorage browser: a automacao expôs `document/window`, mas nao `navigator`/`caches`; validacao ficou em teste/static review.

## 8. Comandos Executados

Base:

- `git status --short`
- `git branch --show-current`
- `git log --oneline -20`
- `git remote -v`
- `git pull`

Validacao inicial:

- `git diff --check`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git status --short`

Auditoria:

- `Get-Content -Raw` dos artefatos P7/P8/P12/post-launch/Sprint 04.
- `Get-Content -Raw` dos arquivos auditados.
- `rg -n "Content-Security-Policy|unsafe-inline|unsafe-eval|script-src|style-src|frame-src|connect-src|img-src|media-src|worker-src|object-src|base-uri|form-action|frame-ancestors|Permissions-Policy|Referrer-Policy|X-Content-Type-Options" .`
- `Select-String -Path ".\**\*" -Pattern ... -ErrorAction SilentlyContinue`
- `rg -n "style=\{|dangerouslySetInnerHTML|eval\(|new Function|setAttribute\(['\"]style|innerHTML" src api index.html`
- `npm pkg get scripts`

Testes/smoke:

- `npx vitest run tests/cspHeaders.test.ts src/services/media/musicEmbedService.test.ts src/services/pwa/cachePolicy.test.ts`
- `npm run build`
- `npm run preview -- --host 127.0.0.1 --port 4173`
- Browser smoke em `http://127.0.0.1:4173/`
- Servidor local temporario com CSP real em `http://127.0.0.1:4174/`
- Browser smoke em `http://127.0.0.1:4174/`

Validacao final:

- `git diff --check`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git status --short`

## 9. Resultado Real dos Comandos

Inicial:

- `git diff --check`: PASS.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 146 files e 562 tests.
- `npm run build`: PASS.
- `git status --short`: apenas `?? .ops/pr-41-review/`.

Targeted:

- `npx vitest run tests/cspHeaders.test.ts src/services/media/musicEmbedService.test.ts src/services/pwa/cachePolicy.test.ts`: PASS, 3 files e 14 tests.
- `npm run build`: PASS.
- `npm run preview`: PASS, `http://127.0.0.1:4173/`.
- CSP server local: PASS, `Content-Security-Policy` presente em `http://127.0.0.1:4174/`.
- Browser boot/dashboard sob CSP real: PASS.

Final:

- `git diff --check`: PASS.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 147 files e 564 tests.
- `npm run build`: PASS.
- `git status --short`: mudancas Sprint 05 mais `?? .ops/pr-41-review/` preexistente.

E2E:

- `E2E NOT AVAILABLE / SKIPPED - risco ja aceito e tratado no Sprint 01`.

## 10. Riscos Remanescentes

- `style-src 'unsafe-inline'` permanece.
- MusicPlayer UI nao montado; embed smoke UI real pendente.
- PWA offline/cache browser smoke completo pendente.
- E2E/Coverage seguem bloqueados/aceitos.
- OAuth/Billing sandbox seguem pendentes.
- Rollback real em deploy provider segue pendente.

## 11. Proxima Acao

Executar Stabilization Execution Sprint 06 - PWA Offline/Cache Browser Smoke ou Stripe/OAuth Sandbox Provisioning, dependendo de ambiente autorizado.
