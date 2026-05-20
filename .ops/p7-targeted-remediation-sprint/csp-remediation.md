# P7 — CSP Remediation

## Escopo
Auditoria e remediação segura de CSP sem hardening agressivo não validado em smoke browser dedicado.

## Matriz de diretivas

| Diretiva | Estado atual | Estado desejado | Mudança aplicada | Risco | Status |
|---|---|---|---|---|---|
| default-src | `'self'` | manter `'self'` | Nenhuma | baixo | Mantido |
| script-src | `'self' 'unsafe-inline' 'unsafe-eval' https://html2canvas.hertzen.com` | reduzir `unsafe-*` com nonce/hash em fase futura | Nenhuma alteração runtime nesta sprint | médio (XSS hardening incompleto) | Parcial (planejado) |
| style-src | `'self' 'unsafe-inline' https://fonts.googleapis.com` | manter fonts e migrar inline para nonce/hash gradualmente | Nenhuma | baixo/médio | Mantido |
| connect-src | `'self'` + Supabase + Gemini + Stripe + PostHog + Sentry ingest | consolidar allowlist por ambiente | Nenhuma | médio (origens amplas por wildcard) | Parcial |
| frame-src | Stripe checkout/js | incluir providers de embed efetivamente usados (YouTube/Spotify/SoundCloud) quando iframe externo for permitido por CSP global | **Documentado gap**; sem alteração por risco de regressão não validada browser | médio | Em aberto documentado |
| img-src | `'self' data: blob: https://*.supabase.co` | manter e revisar telemetria/assets externos | Nenhuma | baixo | Mantido |
| media-src | não definido explicitamente | definir quando uso de mídia exigir política dedicada | Não aplicável nesta sprint | baixo | Em aberto |
| worker-src | não definido explicitamente | considerar `'self' blob:` após validação completa do SW/build | Não aplicável nesta sprint | baixo | Em aberto |
| object-src | não definido explicitamente | `object-src 'none'` | Não aplicado por ausência de smoke CSP regressivo | baixo | Planejado |
| base-uri | não definido explicitamente | `base-uri 'self'` | Não aplicado nesta sprint | baixo | Planejado |
| form-action | não definido explicitamente | `form-action 'self'` (+ gateways necessários) | Não aplicado nesta sprint | baixo | Planejado |
| frame-ancestors | `'none'` | manter `'none'` | Nenhuma | baixo | Mantido |
| upgrade-insecure-requests | ausente | avaliar ativação com validação de conteúdo legado | Não aplicado | baixo | Planejado |

## Resultado P7
- CSP foi auditada contra os pontos de uso de música/embed, SW e APIs.
- Não foi feita alteração agressiva sem smoke browser adicional.
- Gap de `frame-src` para players musicais foi registrado como item técnico prioritário para P8 com smoke browser controlado.
