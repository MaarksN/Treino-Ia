# TREINO-IA — Arquitetura Base (PARTE 1)

## Visão geral
A base do produto segue arquitetura **frontend SPA + API serverless + Supabase**:

- **Frontend**: React 19 + Vite + TypeScript + TailwindCSS, mobile-first e PWA-ready.
- **Backend**: rotas `/api/*` serverless (Vercel-compatible) para fluxos críticos.
- **Auth e dados**: Supabase Auth + Postgres + RLS.
- **Billing**: Stripe com webhook assinado e entitlements server-side.
- **IA**: Gemini somente via `api/gemini-proxy.ts` com guardrails e validação de schema.

## Princípios críticos
1. Source of truth server-side para auth, billing, entitlement, gamificação e histórico.
2. `localStorage` apenas para preferências de UI não sensíveis.
3. Segredos nunca no client (`STRIPE_SECRET_KEY`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, etc.).
4. APIs sensíveis derivam usuário da sessão/token e não do body.
5. Falhas de provider externo devem retornar `dataMode: "not_configured"`.

## Camadas
- `src/components/*`: UI modular por domínio.
- `src/services/*`: regras de negócio client-side sem autoridade de segurança.
- `src/utils/*`: validações, regras determinísticas e utilitários.
- `api/_lib/*`: autenticação, erro HTTP, validação e integrações server-side.
- `api/*`: handlers por domínio (billing, stripe, gamification, health, ia).
- `supabase/migrations/*`: evolução de schema + RLS versionada.
- `tests/*`: unitários, handlers de API e regressões críticas.

## Escalabilidade
- Feature flags centralizadas (`src/config/featureFlags.ts`).
- Contratos tipados (`src/types/*`) por módulo.
- CI/CD com lint, typecheck, tests e build em PR.
