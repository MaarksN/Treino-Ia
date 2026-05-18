# Treino IA

Aplicativo React/Vite para treino, IA, nutrição, recuperação, billing premium, PWA, integrações e operação em Vercel/Supabase.

## Stack

- React 19 + Vite
- TypeScript
- Supabase Auth/DB/Storage
- Vercel Functions
- Stripe Billing
- Gemini via `/api/gemini-proxy`
- Vitest

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Validação

```bash
npm run typecheck
npm test
npm run build
npm run validate
```

## Ambiente

Copie `.env.example` para seu ambiente local e configure:

- `GEMINI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_*`

Segredos de CI/CD ficam no GitHub Actions: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## Produção

- `vercel.json` define headers de segurança, CSP e cron de retenção.
- `.github/workflows/ci.yml` roda typecheck, testes e build.
- `.github/workflows/vercel-deploy.yml` publica via Vercel CLI quando os secrets estiverem configurados.
- `.github/workflows/lighthouse.yml` executa Lighthouse CI.

## Documentação

- Roadmap Fase 2 + 3: `docs/roadmap-fase-2-3-treino-ia.md`
- API: `docs/api/openapi.yaml`
- Segurança: `docs/security/responsible-disclosure.md`
- Privacidade: `docs/legal/privacy-policy.md`
- Acessibilidade: `docs/accessibility-wcag-vpat.md`
- Disaster recovery: `docs/disaster-recovery.md`
- Blocos 11-20: `docs/bloco-*.md`


## Status de execução por fases
- ✅ Parte 1 (fundação/arquitetura) documentada em `docs/architecture.md`, `docs/database.md`, `docs/deployment.md`, `docs/runbook.md` e `docs/privacy.md`.
- 🔜 Partes 2–6 serão entregues incrementalmente preservando source-of-truth server-side, RLS e testes críticos.

## Remote Git

Remote `origin` configurado no ambiente local para:

```bash
git remote add origin https://github.com/MaarksN/Treino-Ia.git
```

Verificação:

```bash
git remote -v
```
