# Current State - Controlled Technical Sprint 01

| Area | Arquivo | Estado atual | Risco | Acao nesta sprint |
|---|---|---|---|---|
| Webhook handler | `api/stripe/webhook.ts` | Valida metodo, secret/signature, usa `constructEvent`, chama `recordStripeWebhookEvent(event)` antes de processar tipos suportados. | Se persistencia guardar evento bruto, dados sensiveis recebidos da Stripe podem ficar em Supabase. | Mantido fluxo em memoria; minimizacao aplicada na persistencia. |
| Webhook event store | `api/_lib/billing-store.ts` | Persistia `payload: event` completo em `stripe_webhook_events`. Deduplicacao usa insert por `id` e trata erro `23505`. | Alto: payload completo pode conter email, metadata livre, billing details, payment details ou dados desnecessarios. | Alterado para persistir `minimizeStripeWebhookPayload(event)`. |
| Subscription processing | `api/_lib/billing-store.ts` | `upsertSubscriptionFromStripeSubscription` usa o objeto Stripe original em memoria; metadata e subscription id continuam necessarios para entitlement. | Quebrar metadata em memoria quebraria processamento de assinatura. | Helper nao muta evento original; teste cobre update com objeto original. |
| Stripe client | `api/_lib/stripe-client.ts` | Cliente exige `STRIPE_SECRET_KEY`; nao usado em testes com Stripe real. | Secrets reais nao podem ser usados. | Sem alteracao; nenhum secret usado. |
| Redaction helpers | `api/_lib/redact.ts` | Redaction generica ja cobre email/token/secret, mas webhook store nao usava redaction antes. | Redaction generica ainda poderia preservar estrutura excessiva. | Criado helper allowlist/minimizacao em vez de redigir objeto bruto. |
| HTTP/CORS | `api/_lib/http.ts` | Headers no-store e allow headers para `stripe-signature`. | Nenhum risco direto do payload store. | Sem alteracao. |
| Tests | `tests/billingApiHandlers.test.ts`, `api/_lib/billing.test.ts` | Cobriam guardrails de billing, mas nao minimizacao do payload persistido. | Regressao poderia reintroduzir payload bruto. | Adicionados testes de helper e store. |
