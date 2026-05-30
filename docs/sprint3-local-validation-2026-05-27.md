# Sprint 3 - validacao local em 2026-05-27

Base local: `4bdd185` (`main`, merge da Sprint 3).

Objetivo deste registro: separar o que foi validado localmente do que ainda exige smoke real em staging/sandbox. Este arquivo nao declara Supabase, Stripe, Gemini ou Sentry como prontos sem evidencia externa.

## Validacoes locais

Evidencia local desta rodada:

| Gate                                                                                                                                         | Resultado                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `npm run lint`                                                                                                                               | Passou                                                       |
| `npm run typecheck`                                                                                                                          | Passou                                                       |
| `npx vitest run src/components/OnboardingTour.test.tsx src/services/data/workoutSessionRepository.test.ts --maxWorkers=1 --reporter=verbose` | Passou: 2 arquivos, 14 testes                                |
| `npm run test`                                                                                                                               | Passou: 191 arquivos, 745 testes                             |
| `npm run build`                                                                                                                              | Passou                                                       |
| `npm run test:e2e`                                                                                                                           | Passou: 21 testes                                            |
| `npm run preflight:sprint3`                                                                                                                  | Falhou corretamente por falta de variaveis reais neste shell |
| `npm run preflight:sprint3` com placeholders seguros                                                                                         | Passou com alerta esperado de `plaintext_blocked`            |
| `npm run smoke:sprint3` com Supabase staging e sem `STAGING_APP_URL`                                                                         | Passou `supabase-rls` e pulou API publicada                  |
| `SPRINT3_SMOKE_STRICT=true npm run smoke:sprint3` sem `STAGING_APP_URL`                                                                      | Falhou corretamente                                          |

O lint cobre agora tambem os scripts `scripts/**/*.mjs`, incluindo `preflight-sprint3-env.mjs` e `smoke-sprint3-integrations.mjs`. O `npm run test` fixa `--maxWorkers 4 --reporter=dot` para evitar a instabilidade local do reporter/worker padrao no Windows.

## Smokes bloqueados por credencial ou ambiente

Supabase staging:

- Necessario reautenticar o MCP/CLI Supabase para rodar novamente advisors e schema drift.
- Necessario confirmar `supabase migration list` contra o projeto staging antes do convite.
- O smoke local de RLS usa `SUPABASE_URL` e `SUPABASE_ANON_KEY`; nao usar service role no browser.

Stripe sandbox:

- Necessario `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e prices sandbox reais.
- Necessario `SUPABASE_TEST_ACCESS_TOKEN` de usuario staging autenticado.
- Necessario executar checkout, portal e webhook assinado no ambiente publicado.
- Idempotencia deve ser comprovada reentregando o mesmo evento Stripe e verificando resposta `ignored: true`.

Gemini real:

- Necessario `STAGING_APP_URL`, `SUPABASE_TEST_ACCESS_TOKEN` e `GEMINI_API_KEY` server-side.
- O smoke deve validar request sem sessao `401`, request autenticado `200` quando `GEMINI_SMOKE_EXPECT_SUCCESS=true`, rate limit `429` e erro controlado para chave ausente/quota.

Sentry/observabilidade:

- Necessario `VITE_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_RELEASE` e `SENTRY_DEPLOY_ENV`.
- Confirmar evento controlado em preview/staging.
- Confirmar sourcemaps/release no painel do Sentry quando `SENTRY_AUTH_TOKEN` estiver configurado.
- Criar alerta minimo para erro de API e erro de render antes de abrir convites.

## Decisao local

Localmente, o core esta apto para preview tecnico. A decisao para convites do beta privado continua NO-GO ate que os smokes reais de staging/sandbox passem com `SPRINT3_SMOKE_STRICT=true`.

## Nota operacional desta maquina

Durante a validacao local de 2026-05-27, uma tentativa anterior do Vitest com workers/reporter padrao deixou o workspace compartilhado do Codex em estado inconsistente e marcou muitos arquivos rastreados como deletados. A branch havia acabado de ser criada limpa, entao o worktree foi restaurado para o `HEAD` antes de reaplicar as mudancas. Depois disso, `npm run test` passou com workers limitados.
