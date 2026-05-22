# Test Evidence - Controlled Technical Sprint 01

| Teste | Resultado | Evidencia | Observacao |
|---|---|---|---|
| Payload minimo mantem campos de auditoria | PASS | `api/_lib/stripe-webhook-payload.test.ts` | Cobre event id/type/apiVersion/created/livemode/pendingWebhooks/requestId. |
| Subscription object minimo | PASS | `api/_lib/stripe-webhook-payload.test.ts` | Cobre object id/status/customer/price/product. |
| Checkout session minimo | PASS | `api/_lib/stripe-webhook-payload.test.ts` | Cobre subscription/customer/status/amount/currency. |
| Campos sensiveis removidos | PASS | `api/_lib/stripe-webhook-payload.test.ts` | Cobre email, metadata, billing/payment details, client secret, receipt URL, raw body, signature/header. |
| Evento original nao mutado | PASS | `api/_lib/stripe-webhook-payload.test.ts` | Garante processamento em memoria continua com objeto original. |
| Evento desconhecido nao quebra | PASS | `api/_lib/stripe-webhook-payload.test.ts` | Cobre tipo futuro sem persistir metadata livre. |
| Persistencia usa payload minimizado | PASS | `api/_lib/billing-store.test.ts` | Verifica insert em `stripe_webhook_events` com payload allowlisted. |
| Deduplicacao por event id | PASS | `api/_lib/billing-store.test.ts` | Erro Supabase `23505` continua retornando `false`. |
| Subscription update continua | PASS | `api/_lib/billing-store.test.ts` | `upsertSubscriptionFromStripeSubscription` continua usando evento/objeto original em memoria. |

## Comando especifico executado

```txt
npm test -- api/_lib/stripe-webhook-payload.test.ts api/_lib/billing-store.test.ts
```

Resultado:

```txt
Test Files  2 passed (2)
Tests       8 passed (8)
```
