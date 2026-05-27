# Deploy (Vercel + Supabase)

## Pré-requisitos

1. Projeto Supabase provisionado.
2. Projeto Stripe com preços criados.
3. Projeto Vercel conectado ao repositório.

## Variáveis de ambiente

Configurar a partir de `.env.example`:

- Client-safe: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_PROXY_URL`, `VITE_SENTRY_DSN`, `VITE_SENTRY_RELEASE`, `VITE_FEATURE_AUDIENCE`.
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `GEMINI_API_KEY`, `HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY`.
- Origin allowlist: configure `APP_URL`, `CORS_ALLOWED_ORIGINS`, `TELEMETRY_ALLOWED_ORIGINS` e `OAUTH_REDIRECT_ALLOWED_ORIGINS`; nunca usar wildcard em producao.
- OAuth tokens: use `OAUTH_TOKEN_SECURITY_MODE=encrypted` somente com `HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY` base64 de 32 bytes. Use `plaintext_blocked` enquanto a chave nao estiver pronta.
- Sentry sourcemaps/release: configure `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_RELEASE` e `SENTRY_DEPLOY_ENV`.

## Passos

1. Aplicar migrations no Supabase (`supabase db push` ou pipeline equivalente).
2. Rodar `npm run preflight:sprint3` no ambiente de staging/CI com as variáveis reais carregadas.
3. Publicar frontend/API na Vercel.
4. Configurar webhook Stripe para `/api/stripe/webhook` com assinatura válida.
5. Validar health checks e smoke tests pós-deploy com `SPRINT3_SMOKE_STRICT=true npm run smoke:sprint3`.

## Critérios de go-live MVP privado

- Build/typecheck/tests verdes.
- Entitlement server-side ativo.
- RLS aplicada em tabelas sensíveis.
- Providers ausentes respondendo `not_configured`.

## Gate de beta privado monitorado

- Escopo de 5 a 20 usuarios aprovado e convites congelados fora da lista.
- `VITE_FEATURE_AUDIENCE=user` no ambiente comum do beta.
- Blocos beta/internal/off escondidos para usuario comum.
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` e `npm run test:e2e` verdes.
- Migrations aplicadas e conferidas com `supabase migration list`.
- Rollback definido para o ultimo deploy estavel.
- Sentry ativo com ambiente correto.
- Supabase validado para auth, perfil, plano, historico e treino ativo.
- Gemini validado via proxy ou retorno `not_configured` explicito.
- Stripe validado somente se billing estiver habilitado.

Checklist operacional detalhado: [Beta privado monitorado](./private-beta.md).
