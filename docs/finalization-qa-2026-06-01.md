# Ciclo tecnico de integracao, validacao e QA - 2026-06-01

Objetivo: registrar a rodada tecnica executada antes de considerar a plataforma finalizada. Esta evidencia cobre integracao local, validacao automatizada e criterios de QA/release. A decisao desta rodada e **NO-GO para finalizacao**, porque o E2E Playwright nao conseguiu executar no ambiente atual por ausencia do binario Chromium e o download do browser foi bloqueado por `403 Forbidden`.

## Escopo validado

- Integridade estatica: lint e typecheck da aplicacao, APIs e scripts configurados.
- Regressao automatizada: suite Vitest completa e drift de schema critico.
- Empacotamento: build Vite de producao.
- E2E/QA funcional: tentativa de executar os fluxos Playwright de smoke, acessibilidade, navegacao, onboarding, cadastro e ciclo de treino.

## Evidencias locais

| Gate                              | Resultado | Observacao                                                                                                                                                                               |
| --------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`                    | Passou    | ESLint concluiu sem erros.                                                                                                                                                               |
| `npm run typecheck`               | Passou    | `tsc --noEmit` concluiu sem erros.                                                                                                                                                       |
| `npm run test`                    | Passou    | 196 arquivos e 769 testes passaram; houve apenas logs esperados de ambiente/mocks.                                                                                                       |
| `npm run build`                   | Passou    | Build Vite de producao concluiu.                                                                                                                                                         |
| `npm run schema:drift`            | Passou    | 1 arquivo e 2 testes passaram.                                                                                                                                                           |
| `npm run test:e2e`                | Bloqueado | 21 cenarios falharam antes de iniciar por falta do Chromium Playwright em `/root/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell`. |
| `npx playwright install chromium` | Bloqueado | Download do Chrome for Testing `148.0.7778.96` retornou `403 Forbidden` no CDN do Playwright.                                                                                            |

## Analise de QA

### Pronto localmente

- O codigo esta coerente para os gates locais de lint, tipos, testes unitarios/de integracao e build.
- O drift de schema monitorado pela suite dedicada nao apontou divergencias no snapshot testado.
- O bundle de producao foi gerado, indicando que imports, split chunks e assets essenciais resolvem corretamente no build.

### Bloqueios antes da finalizacao

- Reexecutar `npm run test:e2e` em um ambiente com browsers Playwright previamente instalados ou com acesso liberado ao CDN do Playwright.
- Registrar evidencia positiva dos 21 cenarios E2E, principalmente smoke do app, navegacao/seguranca, acessibilidade, onboarding, cadastro e ciclo de treino.
- Executar smokes reais de staging/sandbox quando as credenciais estiverem disponiveis: Supabase/RLS, Gemini proxy, Stripe, Sentry e observabilidade.
- Validar a superficie de feature flags para a audiencia alvo antes de liberar qualquer beta ou producao.

## Criterio de saida para considerar finalizada

A plataforma so deve sair de **NO-GO** para **GO** quando todos os itens abaixo estiverem evidenciados no PR/release candidate:

1. `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` e `npm run schema:drift` verdes.
2. `npm run test:e2e` verde em ambiente com browser Playwright instalado.
3. Smokes de staging/sandbox executados com variaveis reais e sem service role exposta no browser.
4. Nenhum bug aberto bloqueando login/cadastro, anamnese, criacao de plano, treino de hoje, finalizacao de treino, historico, recomendacao de IA simples ou billing habilitado.
5. Rollback documentado para o ultimo deploy estavel e monitoramento ativo para erros criticos.

## Decisao desta rodada

**NO-GO para finalizacao.** A base passou nos gates locais de qualidade, mas o ciclo E2E ficou bloqueado pelo ambiente. O proximo passo obrigatorio e destravar o browser Playwright e repetir `npm run test:e2e`; somente depois disso a plataforma pode ser reavaliada para finalizacao.

## O que ainda falta para a plataforma ficar pronta

Esta lista separa o que esta **pronto localmente** do que ainda precisa de evidencia real. O fato de existir codigo, UI ou fallback local nao significa que a funcionalidade esteja pronta para producao; para ser considerada pronta, a area precisa ter integracao real, seguranca validada, observabilidade, rollback e testes automatizados verdes.

| Frente                        | Estado atual observado                                                                                                                                                   | O que falta para ficar pronta                                                                                                                                                                           | Bloqueia finalizacao?                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Estrutura de release          | Ha scripts locais para lint, tipos, testes, build, E2E, cobertura, drift de schema e smokes Sprint 3.                                                                    | Consolidar um gate unico de release que inclua E2E com browser instalado, smokes reais, cobertura minima, audit de dependencias e artefatos versionados por release candidate.                          | Sim                                  |
| Codigo core                   | Lint, typecheck, Vitest, build e schema drift passaram nesta rodada.                                                                                                     | Corrigir ou confirmar ausencia de warnings relevantes dos testes, garantir cobertura minima por dominio critico e manter congelamento de features durante estabilizacao.                                | Sim                                  |
| E2E e QA funcional            | A suite Playwright existe, mas nao rodou neste ambiente por falta do Chromium.                                                                                           | Rodar e registrar E2E verde para smoke, navegacao/seguranca, acessibilidade, onboarding, cadastro e ciclo completo de treino em ambiente com browser instalado.                                         | Sim                                  |
| Funcionalidades reais do core | O escopo de beta define cadastro/login, anamnese, plano, treino de hoje, execucao, series, historico, IA simples e billing condicionado.                                 | Comprovar em staging que um usuario real conclui cadastro/login, cria plano, inicia/finaliza treino, ve historico e recebe/recusa recomendacao de IA sem suporte manual.                                | Sim                                  |
| Superficies beta/internal/off | Feature flags classificam core, beta, internal e off, incluindo OCR, camera/form check, WebXR, tokens de parceiros e scanners biometricos como fora da superficie final. | Garantir em ambiente publicado `VITE_FEATURE_AUDIENCE=user`, auditar rotas/deep links e impedir que previews internos parecam funcionalidades finais para usuario comum.                                | Sim                                  |
| Backend e dados reais         | Existem migrations, testes de drift/RLS e APIs serverless.                                                                                                               | Confirmar `supabase migration list` no projeto alvo, aplicar migrations pendentes, testar auth/RLS/leitura/escrita de perfil/plano/treino/historico com usuario real e sem service role no browser.     | Sim                                  |
| IA real                       | Ha proxy/contratos e fallback `not_configured` esperado quando provedor nao esta ativo.                                                                                  | Validar Gemini server-side com chave real, limites, timeouts, logs redigidos, retorno controlado para quota/erro e auditoria de recomendacoes aplicadas.                                                | Sim                                  |
| Billing real                  | Existem endpoints Stripe e checagens de entitlement.                                                                                                                     | Validar checkout, portal, webhook assinado, idempotencia de evento reentregue, prices sandbox/producao, entitlements server-side e bloqueio de features pagas sem permissao.                            | Sim se billing estiver habilitado    |
| Seguranca de aplicacao        | Existem utilitarios/testes para payload, CORS/redirect, redacao, rate limit, OAuth token security e RLS critica.                                                         | Executar preflight/smoke com secrets reais, revisar CSP em deploy publicado, rodar auditoria de dependencias, confirmar logs sem PII/secrets e revisar permissoes de APIs com usuario anon/autenticado. | Sim                                  |
| Governanca e LGPD             | Existem endpoints de exportacao/apagamento e docs de privacidade.                                                                                                        | Validar DSAR real ponta a ponta, prazos/processo operacional, consentimentos, retencao, trilha de auditoria e aprovacao de politicas antes de convites amplos.                                          | Sim                                  |
| Observabilidade               | Sentry/PostHog estao previstos por variaveis e docs.                                                                                                                     | Confirmar DSN, release, sourcemaps, evento controlado, alertas de erro critico, funil de ativacao e dashboards de `workout_save_failed`, `ai_error`, `billing_error` e erros globais.                   | Sim                                  |
| PWA/mobile                    | Ha manifest/service worker/Capacitor e build web passa.                                                                                                                  | Validar instalacao PWA, offline/online, cache, Android sync/APK em ambiente de release, icones/splash, permissoes e regressao mobile real.                                                              | Sim para release mobile/PWA          |
| Performance e acessibilidade  | Existe Lighthouse config e teste a11y Playwright.                                                                                                                        | Executar Lighthouse/axe em build publicado, validar teclado/leitor de tela/contraste nos fluxos core e registrar budgets de performance.                                                                | Sim                                  |
| Operacao e rollback           | Existem docs de deploy, beta privado e disaster recovery.                                                                                                                | Linkar ultimo deploy estavel, testar rollback de app e plano de reversao de migrations/backups Supabase, definir owner de incidentes e canal de suporte.                                                | Sim                                  |
| Documentacao final            | Ha docs tecnicas, runbook, ADRs e registros de validacao.                                                                                                                | Atualizar README/runbook com procedimento final de release, matriz de owners, checklist assinavel e evidencias anexadas por release candidate.                                                          | Nao sozinho, mas bloqueia governanca |

## Plano recomendado de fechamento

1. **Congelar escopo**: manter somente o core `user` ate os gates ficarem verdes; tudo que for beta/internal/off deve continuar oculto para usuarios comuns.
2. **Destravar E2E**: instalar/cachear Chromium do Playwright no ambiente de CI ou usar runner com browsers preinstalados; repetir `npm run test:e2e` e `npm run test:a11y`.
3. **Validar staging real**: executar `npm run preflight:sprint3` e `SPRINT3_SMOKE_STRICT=true npm run smoke:sprint3` com Supabase, Gemini, Stripe e Sentry reais/sandbox conforme o escopo.
4. **Auditar seguranca e dados**: revisar RLS, secrets, CORS, CSP, redirects, payload limits, rate limits, logs, PII e permissao de cada endpoint critico.
5. **Provar o ciclo de valor**: com usuario staging, concluir cadastro/login, anamnese, plano, treino, historico e recomendacao de IA simples; anexar evidencia do fluxo.
6. **Fechar governanca**: confirmar LGPD/privacidade, suporte, funil, alertas, rollback, disaster recovery e owners operacionais.
7. **Reavaliar GO/NO-GO**: somente promover para GO se todos os bloqueios acima tiverem evidencia positiva e reproduzivel.
