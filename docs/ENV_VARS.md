# Variaveis de Ambiente

## Convencoes

| Prefixo     | Uso                                                 | Exemplo                     |
| ----------- | --------------------------------------------------- | --------------------------- |
| `VITE_`     | Publico no bundle do frontend                       | `VITE_SUPABASE_URL`         |
| sem prefixo | Server-side, CI, Vercel functions ou scripts locais | `SUPABASE_SERVICE_ROLE_KEY` |

## Regras

1. Nunca coloque secrets em `VITE_*`.
2. Toda nova variavel deve entrar em `.env.example` com placeholder seguro.
3. Env publica deve ser validada em `src/config/env.ts`.
4. Env server-side deve ser validada por `scripts/preflight-sprint3-env.mjs`.
5. Nunca use `change_me` como valor default.

## Obrigatorias para staging/producao

| Variavel                            | Uso                                                     |
| ----------------------------------- | ------------------------------------------------------- |
| `VITE_SUPABASE_URL`                 | URL publica do projeto Supabase.                        |
| `VITE_SUPABASE_ANON_KEY`            | Chave anon publica do Supabase.                         |
| `VITE_GEMINI_PROXY_URL`             | Rota publica do proxy seguro da IA.                     |
| `SUPABASE_URL`                      | URL server-side do mesmo projeto Supabase.              |
| `SUPABASE_SERVICE_ROLE_KEY`         | Service role server-side.                               |
| `GEMINI_API_KEY`                    | Chave server-side do Google Gemini.                     |
| `APP_URL`                           | Origem canonica da aplicacao.                           |
| `CORS_ALLOWED_ORIGINS`              | Allowlist de origens para APIs.                         |
| `OAUTH_REDIRECT_ALLOWED_ORIGINS`    | Allowlist de redirects OAuth.                           |
| `OAUTH_TOKEN_SECURITY_MODE`         | `encrypted` por padrao.                                 |
| `HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY` | Base64 que decodifica para 32 bytes quando `encrypted`. |
| `CRON_SECRET`                       | Secret de CRON, minimo 16 caracteres.                   |
| `RETENTION_WORKER_SECRET`           | Secret do worker de retencao, minimo 16 caracteres.     |

## Opcionais

| Variavel                   | Default                   | Uso                         |
| -------------------------- | ------------------------- | --------------------------- |
| `VITE_SENTRY_DSN`          | vazio                     | Monitoramento client-side.  |
| `VITE_SENTRY_RELEASE`      | vazio                     | Release Sentry no frontend. |
| `VITE_POSTHOG_KEY`         | vazio                     | Analytics de produto.       |
| `VITE_POSTHOG_HOST`        | `https://app.posthog.com` | Host PostHog.               |
| `UPSTASH_REDIS_REST_URL`   | vazio                     | Rate limit distribuido.     |
| `UPSTASH_REDIS_REST_TOKEN` | vazio                     | Token do Redis REST.        |

## Supabase

`VITE_SUPABASE_URL` e `SUPABASE_URL` devem apontar para a mesma origem. O frontend usa somente `VITE_SUPABASE_URL`; APIs e scripts server-side podem usar `SUPABASE_URL` com fallback para `VITE_SUPABASE_URL` quando necessario.

## CORS

Use `CORS_ALLOWED_ORIGINS` como fonte principal. `API_ALLOWED_ORIGINS` e variaveis legadas podem continuar sendo lidas por compatibilidade, mas nao devem ser usadas em novos ambientes.
