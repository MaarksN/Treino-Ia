# CSP Current State

| Diretiva/Header | Estado atual | Risco | Pode endurecer agora? | Acao nesta sprint |
|---|---|---|---|---|
| `default-src` | `'self'` | Baixo; base restritiva preservada. | Nao necessario. | Mantido. |
| `script-src` | Antes: `'self' 'unsafe-inline' 'unsafe-eval' https://html2canvas.hertzen.com`. | Medio; `unsafe-inline`/`unsafe-eval` ampliavam superficie XSS. | Sim, para scripts, com build/test/browser smoke sob header CSP real. | Removidos `unsafe-inline` e `unsafe-eval`; mantido `https://html2canvas.hertzen.com`. |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com`. | Medio; inline styles ainda permitidos. | Nao nesta sprint. | Mantido por compatibilidade visual/runtime. Remocao exige migracao para nonce/hash ou `style-src-attr`/`style-src-elem` validada. |
| `img-src` | `'self' data: blob: https://*.supabase.co`. | Baixo/medio; `data:` e `blob:` necessarios para imagens/previews. | Nao sem matriz visual mais ampla. | Mantido. |
| `font-src` | `'self' https://fonts.gstatic.com`. | Baixo. | Nao necessario. | Mantido. |
| `connect-src` | `'self'`, Supabase, Gemini, Stripe API, PostHog e Sentry ingest. | Medio se origem legitima for bloqueada; medio por providers aceitos ainda sem provider externo aprovado para observability real. | Nao nesta sprint. | Mantido para nao quebrar Supabase/API/Gemini/Stripe/observability planejada. |
| `frame-src` | Stripe, YouTube, YouTube-nocookie, Spotify e SoundCloud. | Baixo/medio; precisa alinhar MusicPlayer e checkout/portal Stripe. | Ja endurecido em P8. | Mantido e coberto por teste CSP. |
| `media-src` | `'self' blob:`. | Baixo. | Ja endurecido em P8. | Mantido. |
| `worker-src` | `'self' blob:`. | Baixo; compativel com service worker/blob. | Ja endurecido em P8. | Mantido. |
| `object-src` | `'none'`. | Baixo; bloqueia objetos/plugins legados. | Ja endurecido em P8. | Mantido e coberto por teste CSP. |
| `base-uri` | `'self'`. | Baixo; reduz risco de base tag injection. | Ja endurecido em P8. | Mantido e coberto por teste CSP. |
| `form-action` | `'self'`. | Baixo; restringe submits cross-origin. | Ja endurecido em P8. | Mantido e coberto por teste CSP. |
| `frame-ancestors` | `'none'`. | Baixo; previne framing/clickjacking. | Ja endurecido. | Mantido e coberto por teste CSP. |
| `upgrade-insecure-requests` | Ausente. | Baixo/medio; pode alterar comportamento de recursos legados se ativado. | Nao nesta sprint. | Mantido ausente ate smoke de conteudo misto mais amplo. |
| `block-all-mixed-content` | Ausente. | Baixo/medio; pode quebrar conteudo legado sem matriz ampla. | Nao nesta sprint. | Mantido ausente. |
| `X-Content-Type-Options` | `nosniff`. | Baixo. | Ja adequado. | Mantido. |
| `Referrer-Policy` | `strict-origin-when-cross-origin`. | Baixo. | Ja adequado. | Mantido. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), bluetooth=()`. | Baixo; menor privilegio. | Ja adequado. | Mantido. |

## Arquivos Auditados

- `vercel.json`
- `index.html`
- `public/sw.js`
- `src/components/MusicPlayer.tsx`
- `src/services/media/musicEmbedService.ts`
- `src/services/pwa/cachePolicy.ts`
- `api/_lib/http.ts`
- `api/telemetry/errors.ts`
- `api/gemini-proxy.ts`
- `api/health/oauth/start.ts`
- `api/health/oauth/callback.ts`

## Busca

`rg -n "Content-Security-Policy|unsafe-inline|unsafe-eval|script-src|style-src|frame-src|connect-src|img-src|media-src|worker-src|object-src|base-uri|form-action|frame-ancestors|Permissions-Policy|Referrer-Policy|X-Content-Type-Options" .` encontrou CSP/headers ativos somente em `vercel.json`.
