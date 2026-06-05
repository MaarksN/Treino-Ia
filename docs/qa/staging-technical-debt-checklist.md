# Checklist operacional de staging para quitacao de dividas tecnicas

Status: PREPARACAO / EXECUCAO LOCAL PASS
Data: 2026-06-05
Branch: `codex/execute-technical-debt-plan`

## Escopo

Preparar o ambiente para quitar as dividas tecnicas P1/P2 sem alterar comportamento de produto. Esta checklist cobre somente operacao, env/secrets e baseline local.

## Regras de seguranca

- [ ] Nao commitar arquivos `.env` reais.
- [ ] Nao colar valores de secrets em docs, issues, PRs, logs ou comentarios.
- [ ] Configurar secrets reais apenas em GitHub Actions, Vercel, Supabase, Stripe, Gemini/Google AI e Sentry.
- [ ] Conferir que nenhum secret server-side esta exposto como `VITE_*`.
- [ ] Usar `SPRINT3_SMOKE_STRICT=true` somente em shell/CI seguro com staging isolado.
- [ ] Rotacionar qualquer token que tenha sido impresso por engano em logs externos.

## Estado inicial do git

- [x] Branch de trabalho criada: `codex/execute-technical-debt-plan`.
- [x] Estado inicial conferido em `main`: sem alteracoes pendentes no worktree.
- [x] Nenhuma alteracao preexistente do usuario foi revertida ou sobrescrita.

## Env/secrets exigidos por `npm run preflight:sprint3`

| Grupo            | Variavel                            | Onde configurar                   | Sensibilidade | Observacao                                                                            |
| ---------------- | ----------------------------------- | --------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| Public runtime   | `VITE_SUPABASE_URL`                 | Vercel env + GitHub secret/var    | Publica       | URL do projeto Supabase de staging.                                                   |
| Public runtime   | `VITE_SUPABASE_ANON_KEY`            | Vercel env + GitHub secret/var    | Publica anon  | Pode ir ao bundle, mas deve ser de staging.                                           |
| Public runtime   | `VITE_GEMINI_PROXY_URL`             | Vercel env + GitHub var           | Publica       | Padrao operacional: `/api/gemini-proxy`.                                              |
| Public runtime   | `VITE_SENTRY_DSN`                   | Vercel env + GitHub secret/var    | Publica       | DSN do projeto Sentry de staging.                                                     |
| Server Supabase  | `SUPABASE_URL`                      | GitHub secret + Vercel env server | Publica/infra | Pode reutilizar a mesma URL do `VITE_SUPABASE_URL`.                                   |
| Server Supabase  | `SUPABASE_SERVICE_ROLE_KEY`         | GitHub secret + Vercel env server | Secret        | Nunca expor como `VITE_*`.                                                            |
| Deployed smoke   | `STAGING_APP_URL`                   | GitHub Actions env/runtime        | Publica       | No workflow de preview vem do deploy gerado.                                          |
| Deployed smoke   | `SUPABASE_TEST_ACCESS_TOKEN`        | GitHub secret                     | Secret        | Token de usuario real/sandbox autenticado em staging.                                 |
| Stripe sandbox   | `STRIPE_SECRET_KEY`                 | GitHub secret + Vercel env server | Secret        | Chave sandbox.                                                                        |
| Stripe sandbox   | `STRIPE_WEBHOOK_SECRET`             | GitHub secret + Vercel env server | Secret        | Assinatura do webhook de staging.                                                     |
| Stripe sandbox   | `STRIPE_PRICE_PRO_MONTHLY`          | GitHub secret + Vercel env server | Identificador | Price ID sandbox.                                                                     |
| Stripe sandbox   | `STRIPE_PRICE_PRO_YEARLY`           | GitHub secret + Vercel env server | Identificador | Price ID sandbox.                                                                     |
| Stripe sandbox   | `STRIPE_PRICE_COACH_MONTHLY`        | GitHub secret + Vercel env server | Identificador | Price ID sandbox.                                                                     |
| Stripe sandbox   | `STRIPE_PRICE_COACH_YEARLY`         | GitHub secret + Vercel env server | Identificador | Price ID sandbox.                                                                     |
| Stripe sandbox   | `STRIPE_PRICE_ELITE_MONTHLY`        | GitHub secret + Vercel env server | Identificador | Price ID sandbox.                                                                     |
| Stripe sandbox   | `STRIPE_PRICE_ELITE_YEARLY`         | GitHub secret + Vercel env server | Identificador | Price ID sandbox.                                                                     |
| Gemini           | `GEMINI_API_KEY`                    | GitHub secret + Vercel env server | Secret        | Nunca expor como `VITE_*`.                                                            |
| Sentry release   | `SENTRY_AUTH_TOKEN`                 | GitHub secret                     | Secret        | Necessario para release/sourcemaps.                                                   |
| Sentry release   | `SENTRY_ORG`                        | GitHub secret/var                 | Config        | Organizacao Sentry.                                                                   |
| Sentry release   | `SENTRY_PROJECT`                    | GitHub secret/var                 | Config        | Projeto Sentry.                                                                       |
| Sentry release   | `SENTRY_RELEASE`                    | GitHub Actions env/runtime        | Config        | No preview pode usar SHA do commit.                                                   |
| Sentry release   | `SENTRY_DEPLOY_ENV`                 | GitHub var/env                    | Config        | Usar `staging`.                                                                       |
| Origin allowlist | `APP_URL`                           | Vercel env + GitHub env/runtime   | Publica       | Deve ser HTTPS em staging.                                                            |
| Origin allowlist | `CORS_ALLOWED_ORIGINS`              | Vercel env + GitHub env/runtime   | Publica       | Nao usar `*`; deve apontar para staging.                                              |
| Origin allowlist | `OAUTH_REDIRECT_ALLOWED_ORIGINS`    | Vercel env + GitHub env/runtime   | Publica       | Nao usar localhost em staging.                                                        |
| OAuth mode       | `OAUTH_TOKEN_SECURITY_MODE`         | Vercel env + GitHub var           | Config        | Obrigatorio: `encrypted` ou `plaintext_blocked`.                                      |
| OAuth mode       | `HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY` | GitHub secret + Vercel env server | Secret        | Obrigatorio somente quando `OAUTH_TOKEN_SECURITY_MODE=encrypted`; base64 de 32 bytes. |

## Env/secrets exigidos por `npm run smoke:sprint3`

| Variavel                      | Obrigatoria em smoke estrito? | Sensibilidade | Observacao                                                                |
| ----------------------------- | ----------------------------: | ------------- | ------------------------------------------------------------------------- |
| `SUPABASE_URL`                |                           Sim | Publica/infra | Usada para validar RLS via REST.                                          |
| `SUPABASE_ANON_KEY`           |                           Sim | Publica anon  | O script espera este nome, mesmo que o app use `VITE_SUPABASE_ANON_KEY`.  |
| `STAGING_APP_URL`             |                           Sim | Publica       | Sem ela, o smoke de APIs publicadas e bloqueado em modo estrito.          |
| `SUPABASE_TEST_ACCESS_TOKEN`  |                           Sim | Secret        | Necessario para chamadas autenticadas de Gemini e Stripe em modo estrito. |
| `SPRINT3_SMOKE_STRICT`        |                           Sim | Config        | Deve ser `true` no gate real.                                             |
| `STRIPE_SMOKE_PLAN_ID`        |                           Nao | Config        | Padrao: `pro`.                                                            |
| `STRIPE_SMOKE_INTERVAL`       |                           Nao | Config        | Padrao: `month`.                                                          |
| `GEMINI_SMOKE_EXPECT_SUCCESS` |                           Nao | Config        | Use `true` apenas quando Gemini real deve responder 200.                  |
| `RATE_LIMIT_SMOKE_EXPECT_429` |                           Nao | Config        | Padrao: `false`; use `true` para exigir 429 em chamadas repetidas.        |

## Env/secrets de smokes A/B e compliance

| Variavel                           | Comando                    | Obrigatoria? | Sensibilidade | Observacao                                                        |
| ---------------------------------- | -------------------------- | -----------: | ------------- | ----------------------------------------------------------------- |
| `TENANT_A_ACCESS_TOKEN`            | `npm run smoke:tenant-ab`  |          Sim | Secret        | Token de usuario descartavel A em staging.                        |
| `TENANT_B_ACCESS_TOKEN`            | `npm run smoke:tenant-ab`  |          Sim | Secret        | Token de usuario descartavel B em staging.                        |
| `STAGING_APP_URL`                  | `npm run smoke:compliance` |          Sim | Publica       | URL publicada da Vercel Preview/staging.                          |
| `SUPABASE_TEST_ACCESS_TOKEN`       | `npm run smoke:compliance` |          Sim | Secret        | Token de usuario de staging para export LGPD.                     |
| `COMPLIANCE_ERASURE_ACCESS_TOKEN`  | `npm run smoke:compliance` |  Condicional | Secret        | Token de usuario descartavel criado para delecao real.            |
| `COMPLIANCE_SMOKE_CONFIRM_ERASURE` | `npm run smoke:compliance` |  Condicional | Config        | Deve ser `DELETE_STAGING_USER` para habilitar erasure destrutivo. |

## Env/secrets do `npm run smoke:supabase:social`

| Variavel                              |      Obrigatoria? | Sensibilidade | Observacao                                                                     |
| ------------------------------------- | ----------------: | ------------- | ------------------------------------------------------------------------------ |
| `VITE_SUPABASE_URL` ou `SUPABASE_URL` | Sim para executar | Publica/infra | Se ausente ou placeholder, o smoke pula.                                       |
| `VITE_SUPABASE_ANON_KEY`              | Sim para executar | Publica anon  | Deve ser uma anon key real de staging.                                         |
| `SUPABASE_SERVICE_ROLE_KEY`           |       Recomendado | Secret        | Permite limpar usuarios criados pelo smoke.                                    |
| `SOCIAL_SMOKE_EMAIL_DOMAIN`           |               Nao | Config        | Padrao: `example.com`; usar dominio controlado se o projeto exigir email real. |
| `SOCIAL_SMOKE_SUFFIX`                 |               Nao | Config        | Ajuda a repetir/identificar execucoes.                                         |

## Variaveis operacionais do preview/staging

- [ ] `VERCEL_TOKEN` configurado como GitHub secret.
- [ ] `VERCEL_ORG_ID` configurado como GitHub secret.
- [ ] `VERCEL_PROJECT_ID` configurado como GitHub secret.
- [ ] `VITE_ENV=staging` no gate de preview.
- [ ] `VITE_FEATURE_AUDIENCE=user` no gate de preview.
- [ ] `APP_URL`, `CORS_ALLOWED_ORIGINS` e `OAUTH_REDIRECT_ALLOWED_ORIGINS` apontam para HTTPS de staging/preview.
- [ ] `API_ALLOWED_ORIGINS` e `TELEMETRY_ALLOWED_ORIGINS`, se definidos, tambem usam HTTPS e nunca `*`.
- [ ] Supabase migrations aplicadas antes do smoke real.
- [ ] Stripe webhook sandbox aponta para `/api/stripe/webhook` do ambiente publicado.
- [ ] Sentry release/env de staging configurados antes de validar sourcemaps/alertas.

## Sequencia operacional

- [ ] Conferir branch e worktree limpo antes de carregar secrets.
- [ ] Aplicar/provisionar envs em Vercel e GitHub Actions sem gravar valores no repositorio.
- [ ] Gerar `SUPABASE_TEST_ACCESS_TOKEN` de usuario staging e armazenar somente como secret.
- [ ] Rodar `npm run preflight:sprint3` em CI/shell seguro.
- [ ] Publicar preview/staging.
- [ ] Rodar `SPRINT3_SMOKE_STRICT=true npm run smoke:sprint3` contra `STAGING_APP_URL`.
- [ ] Rodar `npm run smoke:supabase:social` se o fluxo social real entrar no criterio de quitacao.
- [ ] Anexar evidencias com status PASS/FAIL/BLOCKED e sem valores de secrets.
- [ ] Remover/expirar tokens temporarios apos a janela de validacao.

## Baseline local desta etapa

| Comando             | Status | Observacao                                                                                                                                      |
| ------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`            | PASS   | Primeiro bloqueado por `npm` ausente no PATH; Node.js LTS/NPM instalados via WinGet e dependencias instaladas: 537 pacotes, 0 vulnerabilidades. |
| `npm run lint`      | PASS   | ESLint sem erros.                                                                                                                               |
| `npm run typecheck` | PASS   | TypeScript sem erros.                                                                                                                           |
| `npm run test`      | PASS   | Vitest: 194 arquivos e 763 testes passaram; warnings `act(...)` removidos com retirada de testes duplicados antigos.                            |
| `npm run build`     | PASS   | Vite build concluido com sucesso.                                                                                                               |

## Evidencia complementar 2026-06-05

| Comando                                                      | Status  | Observacao                                                                |
| ------------------------------------------------------------ | ------- | ------------------------------------------------------------------------- |
| `npm run format:check`                                       | PASS    | Prettier passou em todos os arquivos.                                     |
| `npm run test:coverage`                                      | PARTIAL | PASS tecnico; cobertura global ainda abaixo de 60%.                       |
| `npm run test:e2e`                                           | PASS    | 21/21 testes Chromium.                                                    |
| `npm run test:a11y`                                          | PASS    | 1/1 axe smoke.                                                            |
| `npx @lhci/cli@0.15.x autorun --config=./lighthouserc.json`  | PASS    | LHCI passou em `dist` local.                                              |
| `npx --yes madge --circular src api --extensions ts,tsx`     | PASS    | Sem dependencias circulares.                                              |
| `npx --yes jscpd --min-lines 10 --reporters console src api` | PARTIAL | 43 clones restantes; duplicacao total 0.92% de linhas.                    |
| `npx --yes ts-prune --project tsconfig.json`                 | PARTIAL | Lista de exports suspeitos gerada para triagem.                           |
| `npm run preflight:sprint3`                                  | BLOCKED | 8 grupos de env ausentes.                                                 |
| `SPRINT3_SMOKE_STRICT=true npm run smoke:sprint3`            | BLOCKED | `SUPABASE_URL is required`.                                               |
| `npm run smoke:tenant-ab`                                    | BLOCKED | `SUPABASE_URL is required`; requer tokens A/B de staging.                 |
| `npm run smoke:compliance`                                   | BLOCKED | `STAGING_APP_URL is required`; erasure destrutivo segue opt-in explicito. |
