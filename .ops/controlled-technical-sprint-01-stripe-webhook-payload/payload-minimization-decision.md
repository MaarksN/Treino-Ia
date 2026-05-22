# Payload Minimization Decision

| Campo | Manter? | Motivo | Risco de privacidade | Observacao |
|---|---|---|---|---|
| `id` | Sim | Deduplicacao/auditoria por evento Stripe. | Baixo | Ja tambem persiste como coluna `id`. |
| `type` | Sim | Auditoria operacional e troubleshooting por tipo de evento. | Baixo | Necessario para entender origem do processamento. |
| `apiVersion` | Sim | Ajuda a diagnosticar formato de evento. | Baixo | Derivado de `api_version`; nao contem PII. |
| `created` | Sim | Auditoria temporal do evento Stripe. | Baixo | Tambem ha `stripe_created_at` em coluna. |
| `livemode` | Sim | Diferenciar test/live sem secret. | Baixo | Booleano operacional. |
| `pendingWebhooks` | Sim | Diagnostico operacional. | Baixo | Numero agregado, nao PII. |
| `requestId` | Sim | Correlacao com Stripe request id. | Baixo/Medio | Mantem `request.id`; nao persiste idempotency key. |
| `object.id` | Sim | Auditoria minima do objeto afetado. | Baixo/Medio | Ex.: `sub_*`, `cs_*`, `pi_*`. |
| `object.object` | Sim | Tipo do objeto Stripe. | Baixo | Ex.: `subscription`, `checkout.session`. |
| `object.customer` | Sim | Auditoria minima e correlacao com assinatura. | Medio | Mantem somente Stripe customer id, sem email/nome/endereco. |
| `object.subscription` | Sim | Auditoria minima de assinatura. | Baixo/Medio | Mantem somente id. |
| `object.status` | Sim | Auditoria do estado processado. | Baixo | Usa `status` ou `payment_status`. |
| `object.priceId` | Sim | Diagnostico de plano/preco. | Baixo | Mantem id de price, nao dados de cliente. |
| `object.productId` | Sim | Diagnostico de produto. | Baixo | Mantem id de product, nao nome/descricao. |
| `object.amount` | Sim | Auditoria financeira minima. | Medio | Valor numerico sem dados pessoais. |
| `object.currency` | Sim | Auditoria financeira minima. | Baixo | Codigo de moeda. |
| `customer_email`, `email` | Nao | PII desnecessaria para deduplicacao/auditoria minima. | Alto | Removido por allowlist. |
| `name`, `phone`, `address` | Nao | PII desnecessaria. | Alto | Removido por allowlist. |
| `metadata` livre | Nao | Pode conter user id, email, notas ou campos arbitrarios. | Alto | Processamento em memoria ainda usa metadata original quando necessario. |
| `payment_method_details`, `billing_details` | Nao | Pode conter detalhes de pagamento/cliente. | Alto | Removido por allowlist. |
| `client_secret`, `secret` | Nao | Segredo operacional. | Alto | Removido por allowlist. |
| `receipt_url` | Nao | Pode expor link sensivel/identificavel. | Medio/Alto | Removido por allowlist. |
| Full invoice lines | Nao | Podem conter descricao e metadados nao necessarios. | Medio/Alto | Somente price/product id extraidos quando disponiveis. |
| Raw request body | Nao | Contem evento bruto completo. | Alto | Nunca persistido. |
| Headers/signature | Nao | Signature e headers nao sao necessarios em auditoria minima. | Alto | Nunca persistidos. |

## Replay Decision

Replay bruto nao e suportado pelo payload persistido minimizado. O trail minimo preserva deduplicacao e auditoria operacional. Replay completo exigiria storage seguro separado, criptografia/retencao aprovada e revisao de privacidade.
