# P8 — CSP Current State Audit

## Fontes auditadas
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

## Achados
- CSP centralizada em `vercel.json` com `script-src` contendo `unsafe-inline` e `unsafe-eval`.
- `frame-src` anterior permitia apenas Stripe (`js.stripe.com` e `checkout.stripe.com`), sem explicitar YouTube/Spotify/SoundCloud usados pelo `MusicPlayer`.
- Headers complementares já existiam: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- `index.html` injeta script remoto `html2canvas.hertzen.com`, justificando presença desse domínio em `script-src`.
- Serviço de embed bloqueia `javascript:`, HTML bruto/srcdoc e restringe providers a YouTube/Spotify/SoundCloud.
- PWA mantém bypass de cache para `/api` e requests com `authorization`.

## Comando de auditoria
- `rg -n "Content-Security-Policy|unsafe-inline|unsafe-eval|frame-src|connect-src|script-src|style-src|Permissions-Policy|Referrer-Policy" .`

## Limitações
- Não há validação browser E2E nesta fase para remoção agressiva de `unsafe-inline`/`unsafe-eval`.
