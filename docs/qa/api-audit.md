# Auditoria de APIs

Status: PARTIAL

## Endpoints mapeados

- `GET /api/billing/entitlement`
- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/create-portal-session`
- `POST /api/stripe/webhook`
- `POST /api/gemini-proxy`
- `GET /api/gamification/state`
- `POST /api/gamification/event`
- `POST /api/compliance/export`
- `POST /api/compliance/erasure`
- `POST /api/sync/offline-actions`
- `POST /api/jobs/create`
- `POST /api/telemetry/errors`
- `POST /api/health/oauth/start`
- `GET /api/health/oauth/callback`
- `POST /api/health/sync`
- `GET/POST /api/retention/worker`
- `GET /api/security/rate-limit`

## Controles encontrados

- Autenticacao Bearer Supabase centralizada em `api/_lib/server-supabase.ts:31`.
- `getBearerToken` exige `Authorization: Bearer` em `api/_lib/http.ts:181`.
- CORS e correlation id em `api/_lib/http.ts`.
- Limites de payload via `readJsonObject` e `JSON_BODY_LIMITS`.
- Stripe webhook exige `stripe-signature` e `STRIPE_WEBHOOK_SECRET` em `api/stripe/webhook.ts:21`.
- Gemini proxy exige usuario autenticado, `GEMINI_API_KEY`, entitlement e rate limit em `api/gemini-proxy.ts:92-112`.
- Offline sync exige idempotency key coerente em `api/sync/offline-actions.ts:58`.
- Retention worker exige segredo em `api/retention/worker.ts:25`.

## Testes locais relevantes

- `tests/billingApiHandlers.test.ts`: auth e payload limits.
- `tests/geminiProxyHardening.test.ts`: auth, retries e erros seguros.
- `tests/criticalApiPayloadLimits.test.ts`: limites antes de escrita.
- `tests/gamificationApiHandlers.test.ts`: idempotencia e validacao de eventos.
- `api/compliance/__tests__/complianceHandlers.test.ts`: export/erasure basicos.

## Lacunas

- Nenhum endpoint foi chamado contra Vercel/staging real.
- Sem teste real de token expirado, usuario de outro tenant, IDOR por ID direto, payload com tenant adulterado ou rate limit distribuido com Upstash real.
- Stripe checkout/portal/webhook nao foram validados em sandbox.
- Gemini nao foi validado contra provider real.

## Decisao de API

PARTIAL. A superficie tem boa cobertura local e controles basicos, mas nao ha evidencia dinamica real suficiente para GO.
