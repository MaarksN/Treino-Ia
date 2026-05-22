# Sandbox Decision

| Area | Sandbox autorizado? | Secrets disponiveis? | Pode executar smoke real? | Decisao | Motivo |
|---|---|---|---|---|---|
| OAuth | Nao | Nao | Nao | `BLOCKED WITH STATIC AUDIT` | Nao ha provider sandbox autorizado, conta de teste, `APP_URL`, redirect allowlist, OAuth client id/secret, Supabase service role, `OAUTH_TOKEN_SECURITY_MODE` ou `HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY` configurados fora do repo nesta sessao. |
| Billing | Nao | Nao | Nao | `BLOCKED WITH STATIC AUDIT` | Nao ha Stripe test mode autorizado, `STRIPE_SECRET_KEY` test, `STRIPE_WEBHOOK_SECRET`, price IDs test, usuario sandbox ou Supabase service role configurados fora do repo nesta sessao. |

## Policy Applied

- Nenhuma credencial pessoal foi usada.
- Nenhum OAuth real foi iniciado.
- Nenhum checkout Stripe foi criado.
- Nenhum webhook Stripe foi disparado.
- Nenhum secret foi impresso, copiado ou commitado.
- Validacao real de sandbox nao foi inferida.

## Decision

Executar somente auditoria estatica de guards/codigo/configuracao e registrar bloqueio honesto para OAuth/Billing sandbox real.
