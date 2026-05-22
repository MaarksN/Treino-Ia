# Billing Current State

| Area | Arquivo | Estado atual | Risco | Acao nesta sprint |
|---|---|---|---|---|
| Stripe client | `api/_lib/stripe-client.ts` | `getStripeClient` exige `STRIPE_SECRET_KEY` e falha com `BILLING_PROVIDER_NOT_CONFIGURED` quando ausente. | O codigo nao diferencia `sk_test_` de `sk_live_`; a garantia de sandbox depende de configuracao segura externa e revisao antes do smoke real. | Auditoria estatica concluida. Smoke real bloqueado sem chave test autorizada. |
| Checkout | `api/stripe/create-checkout-session.ts` | Endpoint `POST` retorna 503 quando `STRIPE_SECRET_KEY` esta ausente, exige usuario Supabase, resolve plano/preco por env e cria sessao Stripe `subscription`. | Sem chave test, price IDs test, usuario sandbox e Supabase service role, nao pode executar. Se uma chave live for configurada por engano, o codigo nao bloqueia por prefixo. | Auditoria estatica concluida. Nenhum checkout foi criado. |
| Price resolution | `api/_lib/billing.ts` | Normaliza planos, bloqueia plano free para checkout e exige `STRIPE_PRICE_*` por plano/intervalo. | Todos os `STRIPE_PRICE_*` estavam ausentes na sessao. | Validado por auditoria e teste existente `api/_lib/billing.test.ts`. |
| Billing portal | `api/stripe/create-portal-session.ts` | Retorna 503 sem `STRIPE_SECRET_KEY`, exige usuario e customer id persistido antes de abrir portal. | Sem Stripe/Supabase sandbox nao ha portal real. | Auditoria estatica concluida. |
| Webhook | `api/stripe/webhook.ts` | Exige `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e header `stripe-signature`; usa `stripe.webhooks.constructEvent`. | Webhook secret sandbox ausente. Erro 400 de assinatura retorna mensagem do Stripe; nenhum secret e impresso pelo codigo auditado, mas o comportamento real nao foi exercitado. | Auditoria estatica concluida. Smoke real bloqueado. |
| Webhook persistence | `api/_lib/billing-store.ts` | Registra evento em `stripe_webhook_events`, deduplica por id e atualiza subscriptions para eventos suportados. | Payload completo do evento Stripe e persistido em `payload`; minimizacao de payload nao esta implementada/provada. Pode conter identificadores de cliente, email ou metadata. | Risco documentado; sem alteracao de schema/runtime nesta sprint. |
| Entitlements | `api/billing/entitlement.ts`, `api/_lib/billing-entitlements.ts` | Retorna fallback free/not_configured quando Supabase nao esta configurado; com backend configurado usa subscription e usage counters como fonte de verdade. | Sem Supabase sandbox nao ha prova real de entitlement pago/webhook. | Auditoria estatica concluida. |
| Frontend billing | `src/services/billingService.ts`, `src/components/PricingTable.tsx`, `src/components/BillingCenter.tsx`, `src/components/PremiumPaywall.tsx` | UI chama endpoints server-side para entitlement, checkout e portal; mensagens indicam Stripe/webhook como fonte de verdade. | Frontend nao prova Stripe sandbox sem backend configurado. | Auditoria estatica concluida. |

## Environment Check

Todos os itens abaixo estavam `MISSING` na sessao local, sem valores impressos:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_YEARLY`
- `STRIPE_PRICE_COACH_MONTHLY`
- `STRIPE_PRICE_COACH_YEARLY`
- `STRIPE_PRICE_ELITE_MONTHLY`
- `STRIPE_PRICE_ELITE_YEARLY`

## Conclusion

Billing possui guards de configuracao ausente, mas o smoke Stripe sandbox real ficou bloqueado por falta de chave test, price IDs test, webhook secret sandbox, usuario/ambiente Supabase e autorizacao explicita. Nenhum checkout, portal ou webhook real foi executado.
