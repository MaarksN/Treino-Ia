# Strict Mode Decision

| Mudanca candidata | Pode aplicar? | Risco | Requer browser smoke? | Decisao | Motivo |
|---|---|---|---|---|---|
| Remover `unsafe-eval` de `script-src` | Sim | Medio se alguma dependencia usar eval em runtime. | Sim | Aplicado | Build, teste CSP e browser smoke sob header real passaram sem console errors. |
| Remover `unsafe-inline` de `script-src` | Sim | Medio se houver script inline. | Sim | Aplicado | `index.html` nao possui script inline; build gerou scripts externos; browser smoke confirmou boot sem inline scripts. |
| Remover `unsafe-inline` de `style-src` | Nao nesta sprint | Medio/alto para regressao visual e libs que aplicam style attributes em runtime. | Sim, com matriz visual maior | Bloqueado com warning | Mantido por compatibilidade; migrar exige nonce/hash ou split `style-src-elem`/`style-src-attr` com browser smoke amplo. |
| `object-src 'none'` | Ja aplicado | Baixo. | Config/build review suficiente | Mantido | Presente desde P8. |
| `base-uri 'self'` | Ja aplicado | Baixo. | Config/build review suficiente | Mantido | Presente desde P8. |
| `form-action 'self'` | Ja aplicado | Baixo. | Config/build review suficiente | Mantido | Presente desde P8. |
| `frame-ancestors 'none'` | Ja aplicado | Baixo. | Config/build review suficiente | Mantido | Presente e compativel com app. |
| `upgrade-insecure-requests` | Nao agora | Medio se houver recurso legado ou ambiente local misto. | Sim | Nao aplicado | Requer matriz de conteudo misto/prod preview dedicada. |
| `block-all-mixed-content` | Nao agora | Medio se houver recurso legado. | Sim | Nao aplicado | Requer matriz browser dedicada. |
| `connect-src` para Supabase/API/Gemini/Stripe | Manter | Alto se bloquear provider legitimo. | Sim para reducao | Mantido | Nao bloquear Supabase, API propria, Gemini, Stripe e endpoints aceitos existentes. |
| `frame-src` para YouTube/Spotify/SoundCloud/Stripe | Manter | Medio se remover provider usado por embed/Stripe. | Sim para reducao | Mantido | Alinhado com `musicEmbedService` e Stripe. |
| `worker-src 'self' blob:` | Manter | Medio se remover `blob:` e alguma dependencia/worker precisar. | Sim para reducao | Mantido | Compativel com PWA e runtime. |
| `media-src 'self' blob:` | Manter | Baixo/medio se remover `blob:` e previews midia quebrarem. | Sim para reducao | Mantido | Politica explicita segura ja presente. |

## Resultado

Strict mode parcial aplicado para scripts. CSP strict final ainda nao pode ser declarada porque `style-src 'unsafe-inline'` permanece por compatibilidade.
