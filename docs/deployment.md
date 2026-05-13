# Deploy (Vercel + Supabase)

## Pré-requisitos
1. Projeto Supabase provisionado.
2. Projeto Stripe com preços criados.
3. Projeto Vercel conectado ao repositório.

## Variáveis de ambiente
Configurar a partir de `.env.example`:
- Client-safe: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `GEMINI_API_KEY`.

## Passos
1. Aplicar migrations no Supabase (`supabase db push` ou pipeline equivalente).
2. Publicar frontend/API na Vercel.
3. Configurar webhook Stripe para `/api/stripe/webhook` com assinatura válida.
4. Validar health checks e smoke tests pós-deploy.

## Critérios de go-live MVP privado
- Build/typecheck/tests verdes.
- Entitlement server-side ativo.
- RLS aplicada em tabelas sensíveis.
- Providers ausentes respondendo `not_configured`.
