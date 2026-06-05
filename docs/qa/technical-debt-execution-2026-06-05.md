# Execucao do plano de divida tecnica - 2026-06-05

Status: NO-GO externo por env/secrets ausentes; gates locais PASS.

Branch: `codex/execute-technical-debt-plan`
Base: `3edc977df841f0c148bf9a4abe7ec796d8db257c`
Fonte dos prompts: `C:/Users/Marks/Desktop/Nova pasta/TREINO IA - PROMPTS PLANO DE DIVIDA TECNICA.html`

## Regras de seguranca

- Nenhum valor real de secret foi gravado no repositorio.
- Evidencias registram somente nomes de variaveis, status e comandos.
- Smokes reais continuam bloqueados ate os secrets serem configurados em shell/CI seguro.

## Checklist de env/secrets

### Preflight `npm run preflight:sprint3`

| Grupo            | Variaveis                                                                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public runtime   | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_PROXY_URL`, `VITE_SENTRY_DSN`                                                                                                                                 |
| Server Supabase  | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`                                                                                                                                                                               |
| Deployed smoke   | `STAGING_APP_URL`, `SUPABASE_TEST_ACCESS_TOKEN`                                                                                                                                                                           |
| Stripe sandbox   | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`, `STRIPE_PRICE_COACH_MONTHLY`, `STRIPE_PRICE_COACH_YEARLY`, `STRIPE_PRICE_ELITE_MONTHLY`, `STRIPE_PRICE_ELITE_YEARLY` |
| Gemini           | `GEMINI_API_KEY`                                                                                                                                                                                                          |
| Sentry release   | `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_RELEASE`, `SENTRY_DEPLOY_ENV`                                                                                                                                |
| Origin allowlist | `APP_URL`, `CORS_ALLOWED_ORIGINS`, `OAUTH_REDIRECT_ALLOWED_ORIGINS`                                                                                                                                                       |
| OAuth mode       | `OAUTH_TOKEN_SECURITY_MODE`; `HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY` quando `OAUTH_TOKEN_SECURITY_MODE=encrypted`                                                                                                             |

### Smokes reais

| Comando                    | Variaveis obrigatorias                                                                                            | Variaveis opcionais/controladas                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run smoke:sprint3`    | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `STAGING_APP_URL`, `SUPABASE_TEST_ACCESS_TOKEN`, `SPRINT3_SMOKE_STRICT=true` | `STRIPE_SMOKE_PLAN_ID`, `STRIPE_SMOKE_INTERVAL`, `GEMINI_SMOKE_EXPECT_SUCCESS`, `RATE_LIMIT_SMOKE_EXPECT_429` |
| `npm run smoke:tenant-ab`  | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TENANT_A_ACCESS_TOKEN`, `TENANT_B_ACCESS_TOKEN`                             | -                                                                                                             |
| `npm run smoke:compliance` | `STAGING_APP_URL`, `SUPABASE_TEST_ACCESS_TOKEN`                                                                   | `COMPLIANCE_ERASURE_ACCESS_TOKEN`, `COMPLIANCE_SMOKE_CONFIRM_ERASURE=DELETE_STAGING_USER`                     |

## Baseline e evidencias

| Comando                                                      | Resultado                                                      | Status       |
| ------------------------------------------------------------ | -------------------------------------------------------------- | ------------ |
| `npm ci`                                                     | 537 packages instalados; 0 vulnerabilidades                    | PASS         |
| `npm run lint`                                               | ESLint sem erros                                               | PASS         |
| `npm run typecheck`                                          | TypeScript sem erros                                           | PASS         |
| `npm run test`                                               | 194 arquivos; 763 testes PASS; warnings `act(...)` removidos   | PASS         |
| `npm run build`                                              | Vite build PASS                                                | PASS         |
| `npm run format:check`                                       | Todos os arquivos conferidos pelo Prettier                     | PASS         |
| `npm run test:coverage`                                      | 33.04% stmts, 27.94% branches, 31.96% funcs, 33.68% lines      | PASS tecnico |
| `npm run test:e2e`                                           | 21/21 testes Chromium PASS                                     | PASS         |
| `npm run test:a11y`                                          | 1/1 axe smoke PASS                                             | PASS         |
| `npm run schema:drift`                                       | 2/2 testes PASS                                                | PASS         |
| `npm audit --json`                                           | 0 vulnerabilidades                                             | PASS         |
| `npx @lhci/cli@0.15.x autorun --config=./lighthouserc.json`  | Lighthouse CI PASS; relatorios temporarios publicados          | PASS         |
| `npx --yes madge --circular src api --extensions ts,tsx`     | Sem dependencias circulares                                    | PASS         |
| `npx --yes jscpd --min-lines 10 --reporters console src api` | Clones reduziram de 100 para 43; duplicacao total 0.92% linhas | PARTIAL      |
| `npx --yes ts-prune --project tsconfig.json`                 | Lista de exports suspeitos gerada para triagem; comando exit 0 | PARTIAL      |
| `npm run preflight:sprint3`                                  | 8 grupos de env ausentes                                       | BLOCKED      |
| `SPRINT3_SMOKE_STRICT=true npm run smoke:sprint3`            | Bloqueado antes de rede: `SUPABASE_URL is required`            | BLOCKED      |
| `npm run smoke:tenant-ab`                                    | Bloqueado antes de rede: `SUPABASE_URL is required`            | BLOCKED      |
| `npm run smoke:compliance`                                   | Bloqueado antes de rede: `STAGING_APP_URL is required`         | BLOCKED      |

Relatorios LHCI temporarios:

- `https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1780629960532-55619.report.html`
- `https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1780629961527-15072.report.html`

## Falhas corrigidas nesta etapa

- DT-004: `npm run format` aplicado; `npm run format:check` passou.
- DT-011: LHCI passou usando `dist` local servido pela CLI.
- DT-003: warnings `act(...)` removidos com a retirada dos testes duplicados `.test.ts` antigos de `useWorkoutManager` e `useCheckinManager`; os equivalentes `.test.tsx` permanecem.
- DT-008: extraida fabrica comum para `src/core/blocks/blocoXXRegistry.ts` e contrato comum de testes; clones reduziram de 100 para 43.
- DT-001/DT-002/DT-005/DT-012: adicionados smokes operacionais e workflow manual para staging sem gravar secrets.
- DT-006/DT-009/DT-010: runbooks/ADR/OpenAPI atualizados para explicitar procedimento, estrategia e placeholder de staging.

## Status por divida

| ID     | Status atual                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------- |
| DT-001 | BLOCKED por secrets/env ausentes; preflight e smoke prontos para CI/shell seguro.                           |
| DT-002 | BLOCKED por tokens A/B ausentes; `npm run smoke:tenant-ab` adicionado.                                      |
| DT-003 | PARTIAL; gate tecnico passa, warnings removidos, cobertura global ainda abaixo de 60%.                      |
| DT-004 | PASS.                                                                                                       |
| DT-005 | BLOCKED por sandbox real ausente; smoke cobre Supabase, Gemini, Stripe e rate limit.                        |
| DT-006 | PARTIAL; runbook de ensaio atualizado, execucao real de backup/restore ainda depende de staging.            |
| DT-007 | BLOCKED por secrets Sentry ausentes.                                                                        |
| DT-008 | PARTIAL; clones baixaram para 43, ainda acima da meta ideal `<30`; exports do `ts-prune` triados por lista. |
| DT-009 | PASS documental; ADR aceita Vercel + Supabase para MVP/private beta sem Docker/IaC obrigatorio.             |
| DT-010 | PARTIAL; OpenAPI nao aponta mais para prod falsa, mas URL real de staging ainda nao foi validada.           |
| DT-011 | PASS local.                                                                                                 |
| DT-012 | BLOCKED por token real ausente; `npm run smoke:compliance` adicionado com erasure destrutivo opt-in.        |

## Decisao

O repositorio esta pronto para PR e merge das automacoes, docs e reducoes locais de divida. A liberacao de produto continua NO-GO ate `preflight:sprint3`, `smoke:sprint3`, `smoke:tenant-ab` e `smoke:compliance` passarem contra staging real com secrets provisionados fora do repositorio.
