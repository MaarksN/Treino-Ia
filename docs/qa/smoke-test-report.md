# Relatorio Smoke

Status: BLOCKED

## Smokes executados

### `npm run preflight:sprint3`

Resultado: FAIL

Passou:

- Origin allowlists checked.
- No forbidden `VITE_*` secret names in current env.
- `.env.example` public/server env split checked.

Falhou por ausencia de:

- Public runtime: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_PROXY_URL`, `VITE_SENTRY_DSN`.
- Server Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Deployed smoke: `STAGING_APP_URL`, `SUPABASE_TEST_ACCESS_TOKEN`.
- Stripe sandbox: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`.
- Gemini: `GEMINI_API_KEY`.
- Sentry release: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_RELEASE`, `SENTRY_DEPLOY_ENV`.
- Origin allowlist: `APP_URL`, `CORS_ALLOWED_ORIGINS`, `OAUTH_REDIRECT_ALLOWED_ORIGINS`.
- `OAUTH_TOKEN_SECURITY_MODE`.

### `npm run smoke:sprint3`

Resultado: FAIL

- Output: `FAIL SUPABASE_URL is required`.

### `npm run smoke:supabase:social`

Resultado: SKIP/BLOCKED

- Output: `SKIP: configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY reais para rodar o smoke test social.`

## Decisao smoke

BLOCKED. Como smoke real de staging esta ausente, a decisao final obrigatoria pelo roteiro e NO-GO.
