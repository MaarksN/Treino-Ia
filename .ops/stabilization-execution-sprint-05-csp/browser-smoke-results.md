# Browser Smoke Results

| Smoke | Executado? | Resultado | Evidencia | Observacao |
|---|---|---|---|---|
| `npm run build` pre-smoke | Sim | PASS | Vite build: 1970 modules transformed; build concluido. | Warning conhecido: empty chunk `motion`. |
| `npm run preview` | Sim | PASS | Preview local em `http://127.0.0.1:4173/`, HTTP 200. | Vite preview nao aplica headers de `vercel.json`. |
| CSP header local real | Sim | PASS | Servidor temporario em `http://127.0.0.1:4174/` serviu `dist` com `Content-Security-Policy` de `vercel.json`; HTTP 200 confirmou header. | Servidor temporario sem arquivos novos no repo. |
| App boot sob CSP real | Sim | PASS | Browser em `http://127.0.0.1:4174/`: `rootHasContent=true`, titulo `Treino Inteligente`, `inlineScriptCount=0`, scripts externos `self` e `html2canvas`; console errors/warnings vazio. | Valida remocao de `script-src unsafe-inline/unsafe-eval` para boot inicial. |
| Dashboard/rota inicial sob CSP real | Sim | PASS | Cadastro local com dados sinteticos (`Smoke Test`, `smoke@example.invalid`) levou a tela de anamnese; console errors/warnings vazio. | Sem OAuth/Billing/producao. Supabase ausente caiu em persistencia local esperada. |
| Music embeds permitidos | Parcial | PASS (TEST/CONFIG), BROWSER UI NOT MOUNTED | `src/services/media/musicEmbedService.test.ts` cobre YouTube, Spotify, SoundCloud, `javascript:` e HTML bruto; `tests/cspHeaders.test.ts` cobre `frame-src` dos providers. | `MusicPlayer` esta exportado mas nao montado em `App`/`Dashboard`, entao nao houve smoke UI real do player. |
| URL invalida de embed bloqueada | Parcial | PASS (TEST) | `musicEmbedService.test.ts` rejeita HTML bruto, `javascript:` e dominio fora da allowlist. | Nao executado via UI porque o player nao esta montado. |
| `/api` nao cacheada pelo service worker | Parcial | PASS (TEST/STATIC), BROWSER CACHE INSPECTION BLOCKED | `src/services/pwa/cachePolicy.test.ts` cobre `/api/*` e Authorization como `network-only`; `public/sw.js` usa `shouldBypassCache` para `/api/`. | A automacao browser expôs `document/window`, mas nao `navigator`/`caches`, bloqueando inspecao direta de CacheStorage. |
| CSP headers documentados | Sim | PASS | `vercel.json`, `tests/cspHeaders.test.ts`, este arquivo e `csp-current-state.md`. | CSP strict final nao declarado porque `style-src 'unsafe-inline'` permanece. |

## Browser Smoke Verdict

`PASS WITH WARNINGS`.

O boot e a rota inicial passaram sob CSP real com `script-src` sem `unsafe-inline`/`unsafe-eval`. Music embeds e PWA/API cache ficaram parcialmente validados por testes/configuracao, com bloqueios honestos para UI nao montada e limitacao da automacao de browser.
