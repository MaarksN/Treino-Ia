# P8 — CSP Changes

| Arquivo | Mudança | Motivo | Risco | Como validar |
|---|---|---|---|---|
| `vercel.json` | Expandido `frame-src` para incluir hosts de embeds permitidos (YouTube/Spotify/SoundCloud) | Evitar quebra do MusicPlayer com CSP alinhada à allowlist de app | Baixo | Build + testes + revisão de allowlist em `musicEmbedService` |
| `vercel.json` | Adicionado `media-src 'self' blob:` | Restringir mídia a origens esperadas | Baixo | Build e smoke funcional de áudio/embed |
| `vercel.json` | Adicionado `worker-src 'self' blob:` | Tornar política explícita para worker/PWA | Baixo | Build e validação de SW sem erro |
| `vercel.json` | Adicionado `object-src 'none'` | Bloquear plugins/objetos legados | Muito baixo | Build/config review |
| `vercel.json` | Adicionado `base-uri 'self'` e `form-action 'self'` | Hardening contra injection/post cross-origin | Baixo | Build/config review |
| `vercel.json` | Endurecida `Permissions-Policy` para `camera=(), microphone=(), geolocation=(), bluetooth=()` | Menor privilégio por padrão | Baixo | Revisão estática; app não depende desses recursos |
