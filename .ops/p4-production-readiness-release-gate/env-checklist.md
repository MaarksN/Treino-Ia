# P4 Environment Checklist

| Variável | Obrigatória? | Ambiente | Risco se ausente | Status |
|---|---|---|---|---|
| Supabase URL (`VITE_SUPABASE_URL`) | Sim | Staging, Produção | App/API não conectam ao backend | Pendente validação final |
| Supabase anon key (`VITE_SUPABASE_ANON_KEY`) | Sim | Staging, Produção | Falha de autenticação no client | Pendente validação final |
| Supabase service role (`SUPABASE_SERVICE_ROLE_KEY`) | Sim | Server (staging/prod) | APIs server-side falham | Pendente validação final |
| Gemini API key (`GEMINI_API_KEY`) | Sim (se IA habilitada) | Server (staging/prod) | Fluxos de IA indisponíveis | Pendente validação final |
| OAuth provider client id (`*_CLIENT_ID`) | Sim (quando provider ativo) | Server (staging/prod) | OAuth start/callback inválidos | Pendente validação final |
| OAuth provider client secret (`*_CLIENT_SECRET`) | Sim (quando provider ativo) | Server (staging/prod) | Troca de token OAuth falha | Pendente validação final |
| OAuth token encryption key (`OAUTH_TOKEN_ENCRYPTION_KEY`) | Sim | Server (staging/prod) | Tokens sensíveis sem proteção adequada | Pendente validação final |
| Stripe public key (`VITE_STRIPE_PUBLISHABLE_KEY`) | Sim (billing ativo) | Staging, Produção | Checkout client indisponível | Pendente validação final |
| Stripe secret key (`STRIPE_SECRET_KEY`) | Sim (billing ativo) | Server (staging/prod) | APIs de cobrança indisponíveis | Pendente validação final |
| Webhook secrets (`STRIPE_WEBHOOK_SECRET`, similares) | Sim (webhooks ativos) | Server (staging/prod) | Webhooks rejeitados ou inseguros | Pendente validação final |
| App URL / Vercel URL (`APP_URL`, `VERCEL_URL`) | Sim | Staging, Produção | Redirect/OAuth/links quebrados | Pendente validação final |
| Telemetry config (`SENTRY_DSN`/equivalente) | Recomendado | Staging, Produção | Baixa observabilidade de incidentes | Pendente validação final |

> Observação: este checklist não contém valores reais e deve ser preenchido no momento do gate de deploy.
