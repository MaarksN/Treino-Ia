# Billing Smoke Results

| Caso | Executado? | Resultado | Evidencia | Observacao |
|---|---|---|---|---|
| Checkout sandbox | Nao, real bloqueado; auditoria estatica executada | `BLOCKED WITH EVIDENCE` | `api/stripe/create-checkout-session.ts` depende de `STRIPE_SECRET_KEY`, usuario Supabase e `STRIPE_PRICE_*`. Todos ausentes na sessao. | Nenhuma sessao Stripe foi criada. Nenhum pagamento real ou test payment foi iniciado. |
| Config ausente | Sim, auditoria estatica | `PASS (AUDIT)` | `api/_lib/stripe-client.ts`, `api/stripe/create-checkout-session.ts` e `api/stripe/create-portal-session.ts` falham fechado com `BILLING_PROVIDER_NOT_CONFIGURED`/503 quando `STRIPE_SECRET_KEY` nao existe. | Comportamento nao foi exercitado via servidor local; validacao foi por codigo/testes existentes. |
| Webhook secret | Nao, real bloqueado; auditoria estatica executada | `BLOCKED WITH EVIDENCE` | `api/stripe/webhook.ts` exige `STRIPE_WEBHOOK_SECRET` e `stripe-signature` antes de construir evento. `STRIPE_WEBHOOK_SECRET` ausente. | Nenhum webhook real/sandbox foi enviado. |
| Payload minimization | Sim, auditoria estatica | `WARNING / OPEN RISK` | `api/_lib/billing-store.ts` persiste `payload: event` completo em `stripe_webhook_events`. | Minimização de payload nao esta implementada/provada; nao alterar schema/runtime nesta sprint. |
| Billing guard | Sim, audit/test existente | `PASS (AUDIT/TEST)` | `api/_lib/billing.ts` bloqueia plano invalido/free checkout e exige price env; `api/billing/entitlement.ts` retorna free/not_configured sem Supabase. | Real entitlement pago segue nao provado sem webhook/Stripe/Supabase sandbox. |
| Erro seguro | Sim, audit/test existente | `PASS/PARTIAL (AUDIT/TEST)` | `api/_lib/http.ts` aplica 500 generico; Stripe config ausente retorna erro controlado. | Webhook 400 inclui mensagem de assinatura do Stripe; nenhum secret aparece no codigo auditado, mas smoke real nao foi executado. |

## Billing Result

`BLOCKED WITH EVIDENCE`.

Billing sandbox real nao foi validado porque nao havia Stripe test key, price IDs test, webhook secret sandbox, Supabase service role ou autorizacao explicita. Nenhum pagamento real foi executado.
