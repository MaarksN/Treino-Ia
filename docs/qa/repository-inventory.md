# Inventario do Repositorio

Status: PASS para inventario local; PARTIAL para ambientes externos.

## Estrutura principal

- `src/`: SPA React/Vite, componentes, hooks, servicos, stores, regras e utilitarios.
- `api/`: Vercel Functions por dominio: billing, Stripe, Gemini, gamification, health, compliance, sync, jobs, telemetry e retention worker.
- `supabase/migrations/`: 16 migrations SQL versionadas.
- `tests/`: testes unitarios/integracao e E2E Playwright.
- `docs/`: documentacao de arquitetura, API, deploy, DR, privacidade, ADRs e blocos de produto.
- `.github/workflows/`: CI, Lighthouse, deploy e preview Vercel.
- `android/`: projeto Capacitor Android.
- `public/`: PWA, service worker e assets.

## Stack detectada

- React 19, Vite 8, TypeScript 6, Tailwind via `@tailwindcss/vite`.
- Supabase Auth/DB/Storage via `@supabase/supabase-js`.
- Vercel Functions para backend serverless.
- Stripe Billing.
- Gemini via `/api/gemini-proxy`.
- Sentry React/Vite plugin.
- Vitest + Testing Library + jsdom.
- Playwright + axe-core.
- Capacitor Android.

## Scripts relevantes

- `dev`: Vite na porta 3000.
- `build`: Vite build.
- `typecheck`: TypeScript `tsc --noEmit`.
- `lint`: ESLint para `src`, `tests`, `api`, `scripts` e raiz.
- `test`: Vitest.
- `test:coverage`: Vitest coverage.
- `test:e2e`: Playwright.
- `schema:drift`: guarda de schema/migrations.
- `preflight:sprint3`, `smoke:sprint3`, `smoke:supabase:social`: validacoes reais dependentes de env.

## Marcadores e mocks

Evidencias encontradas por `rg`:

- `src/services/healthService.ts:18`: `MOCK_WARNING` para modo `mock_dev_only`.
- `src/services/legacyTrainingSyncService.ts:8`: chave local `mock_dev_only`.
- `src/components/GlobalFeed.tsx:4`: `FAKE_POSTS`.
- `src/components/platform/AdvancedPlatformHub.tsx:611`: URL `https://example.com/n8n/treino`.
- Nenhum `eslint-disable-line react-hooks/exhaustive-deps` restante em `src/components/ActiveWorkoutView.tsx`.

## Testes existentes

- Quick scan contou 200 arquivos `*.test.*`/`*.spec.*` apos remover testes duplicados antigos.
- Vitest executou 194 arquivos e 763 testes.
- Playwright executou 21 testes E2E locais.
