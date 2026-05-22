# Evidence - Controlled Technical Sprint 01

## 1. Objetivo

Minimizar e redigir o payload persistido dos webhooks Stripe em `stripe_webhook_events.payload`, preservando deduplicacao, auditoria minima e processamento de assinatura, sem executar Stripe real, pagamento real, secrets ou migrations.

## 2. Base auditada

| Item | Resultado |
|---|---|
| Branch | `main` |
| Top commit inicial | `5b8a2c7 Add final stabilization closure report` |
| Commit esperado | `5b8a2c75b7a2f1c728c385bb6c2584bae2ba125a` presente no topo |
| Remote | `origin https://github.com/MaarksN/Treino-Ia.git` |
| `git pull` | `Already up to date.` |
| Working tree inicial | Limpa |

## 3. Estado anterior

`api/_lib/billing-store.ts` persistia:

```txt
payload: event as unknown as Record<string, unknown>
```

Isso armazenava o evento Stripe completo em `stripe_webhook_events.payload`, incluindo campos potencialmente sensiveis ou desnecessarios para auditoria minima.

## 4. Payload minimo definido

O helper `minimizeStripeWebhookPayload(event)` preserva somente:

- `id`
- `type`
- `apiVersion`
- `created`
- `livemode`
- `pendingWebhooks`
- `requestId`
- `object.id`
- `object.object`
- `object.customer`
- `object.subscription`
- `object.status`
- `object.priceId`
- `object.productId`
- `object.amount`
- `object.currency`

Campos removidos por design:

- email/customer_email
- nome/telefone/endereco
- metadata livre
- billing_details
- payment_method_details
- client_secret/secret
- receipt_url
- linhas completas de invoice
- raw body
- headers/signature

## 5. Codigo alterado

| Arquivo | Mudanca |
|---|---|
| `api/_lib/stripe-webhook-payload.ts` | Helper novo de minimizacao por allowlist. |
| `api/_lib/billing-store.ts` | `recordStripeWebhookEvent` passa a persistir payload minimizado. |
| `api/_lib/stripe-webhook-payload.test.ts` | Testes novos para minimizacao e remocao de campos sensiveis. |
| `api/_lib/billing-store.test.ts` | Testes novos para persistencia minimizada, deduplicacao e subscription update. |

## 6. Testes criados/ajustados

- `api/_lib/stripe-webhook-payload.test.ts`
- `api/_lib/billing-store.test.ts`

Comando especifico:

```txt
npm test -- api/_lib/stripe-webhook-payload.test.ts api/_lib/billing-store.test.ts
```

Resultado:

```txt
Test Files  2 passed (2)
Tests       8 passed (8)
```

## 7. Resultado real dos comandos

| Comando | Resultado |
|---|---|
| `git pull` | PASS, `Already up to date.` |
| `git diff --check` inicial | PASS |
| `npm run lint` inicial | PASS |
| `npm run typecheck` inicial | PASS |
| `npm test` inicial | PASS, 148 files / 570 tests |
| `npm run build` inicial | PASS, 1970 modules transformed |
| Teste especifico payload/store | PASS, 2 files / 8 tests |
| `git diff --check` final | PASS, com warning CRLF em `api/_lib/billing-store.ts` |
| `npm run lint` final | PASS |
| `npm run typecheck` final | PASS |
| `npm test` final | PASS, 150 files / 578 tests |
| `npm run build` final | PASS, 1970 modules transformed |
| `git status --short` final pre-commit | Arquivos deste sprint em `api/_lib` e `.ops/controlled-technical-sprint-01-stripe-webhook-payload/` |

E2E NOT AVAILABLE / SKIPPED - risco aceito desde Sprint 01.

## 8. Riscos remanescentes

- Webhook Stripe real ainda nao executado.
- Billing sandbox ainda depende de secrets/ambiente autorizado.
- Replay bruto nao e suportado pelo payload minimizado.
- Campos minimos devem ser revalidados em sandbox real quando disponivel.

## 9. Proxima acao

Controlled Technical Sprint 02 - OAuth/Billing Sandbox Provisioning ou Playwright/Coverage Registry Allowlist.
