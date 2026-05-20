# Billing Sandbox Smoke

| Caso | Resultado | Evidência | Observação |
|---|---|---|---|
| Nenhuma cobrança real no smoke | PASS (audit) | integração Stripe depende de chaves/env e endpoints server-side | sem chave live usada |
| Sandbox exigido para smoke real | PASS (audit) | `getStripeClient` exige `STRIPE_SECRET_KEY`; sem chave falha controlada | smoke real bloqueado sem chaves test |
| Guards/previews honestos | PASS (audit) | serviços premium documentam preview local sem entitlement fake | sem mascarar billing como ativo |
| Erros não expõem secrets | PASS (audit) | `handleApiError` + redaction de payloads sensíveis | retorno 500 genérico |
| Checkout sandbox real | BLOQUEADO | não há credenciais Stripe sandbox nesta execução | não executado |
