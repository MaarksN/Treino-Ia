# P8 — CSP Target State

| Diretiva | Estado atual | Estado alvo | Pode aplicar agora? | Motivo |
|---|---|---|---|---|
| default-src | `'self'` | `'self'` | Sim | Base segura já adequada |
| script-src | `'self' 'unsafe-inline' 'unsafe-eval'` + html2canvas | Manter atual nesta fase | Parcial | Remoção exige validação browser abrangente |
| style-src | `'self' 'unsafe-inline'` + Google Fonts CSS | Manter atual nesta fase | Parcial | UI depende de estilos inline/framework |
| img-src | `'self' data: blob: https://*.supabase.co` | Manter | Sim | Compatível com app e uploads |
| font-src | `'self' https://fonts.gstatic.com` | Manter | Sim | Necessário para fontes carregadas |
| connect-src | self + supabase + gemini + stripe + observability endpoints | Manter | Sim | Evita regressão API/runtime |
| frame-src | apenas Stripe | Stripe + YouTube + YouTube-nocookie + Spotify + SoundCloud embed | Sim | Alinhar CSP com allowlist real do MusicPlayer |
| media-src | ausente | `'self' blob:` | Sim | Endurecimento seguro para mídia local/blob |
| worker-src | ausente | `'self' blob:` | Sim | Compatível com SW/PWA |
| object-src | ausente | `'none'` | Sim | Hardening clássico sem impacto esperado |
| base-uri | ausente | `'self'` | Sim | Evita base tag injection |
| form-action | ausente | `'self'` | Sim | Restringe submits inesperados |
| frame-ancestors | `'none'` | `'none'` | Sim | Já adequado |
| upgrade-insecure-requests | ausente | não aplicar agora | Não | Pode afetar integrações legadas sem validação extra |
| block-all-mixed-content | ausente | não aplicar agora | Não | Requer validação browser detalhada |
| Referrer-Policy | `strict-origin-when-cross-origin` | manter | Sim | Boa proteção/compatibilidade |
| Permissions-Policy | permitia `camera(self)` e `bluetooth(self)` | bloquear permissões sensíveis (`()`) | Sim | Princípio de menor privilégio |
| X-Content-Type-Options | `nosniff` | manter | Sim | Já endurecido |
