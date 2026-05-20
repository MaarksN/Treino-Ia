# CSP Smoke

| Caso | Resultado | Evidência | Observação |
|---|---|---|---|
| CSP não bloqueia build | PASS | `npm run build` concluído com sucesso | smoke de build ok |
| frame-src apenas providers autorizados | PASS | Stripe/YouTube/Spotify/SoundCloud listados em `vercel.json` | restrição explícita |
| object-src `'none'` | PASS | diretiva presente | hardening ativo |
| base-uri `'self'` | PASS | diretiva presente | hardening ativo |
| form-action `'self'` | PASS | diretiva presente | hardening ativo |
| unsafe-inline/unsafe-eval documentados | PASS COM RISCO | ainda presentes em `script-src`/`style-src` | risco registrado para fase futura |
| Smoke browser completo CSP | BLOQUEADO PARCIAL | sem suíte E2E browser ativa nesta execução | dependente de infraestrutura P10 real |
