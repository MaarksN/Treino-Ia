# Runbook Operacional

## Rotina diaria do beta privado

1. Revisar Sentry por novos erros no fluxo core.
2. Revisar funil: `registration_completed` -> `anamnesis_completed` -> `first_plan_created` -> `first_workout_started` -> `first_workout_completed` -> `day_7_return_detected`.
3. Investigar imediatamente `workout_save_failed`, `ai_error` e `billing_error`.
4. Triar feedback qualitativo do canal privado.
5. Priorizar bugs que impedem login, anamnese, plano, treino ativo, historico ou pagamento habilitado.
6. Manter novas features congeladas ate a decisao pos-beta.

## Incidente: billing inconsistente

1. Verificar eventos recentes no webhook Stripe.
2. Reprocessar evento idempotente se necessário.
3. Conferir `api/billing/entitlement` e fonte de verdade no banco.

## Incidente: Stripe webhook falhando

1. Confirmar `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY` e logs do endpoint `/api/stripe/webhook`.
2. Localizar o evento no Stripe Dashboard e comparar com o registro idempotente salvo pelo backend.
3. Se o evento ainda nao foi persistido, reprocessar pelo Stripe usando o mesmo `event.id`.
4. Se houve processamento parcial, corrigir o estado no banco antes de reentregar o evento.
5. Validar `/api/billing/entitlement` para o usuario afetado e anexar o `X-Correlation-ID` aos logs do incidente.

## Incidente: sync offline travado

1. Confirmar se o cliente esta gerando `X-Idempotency-Key` e `X-Correlation-ID`.
2. Verificar `/api/sync/offline-actions` para erros 401, 409 ou 5xx no periodo reportado.
3. Conferir se a fila local marcou a acao como `failed` e quantas tentativas foram feitas.
4. Reprocessar apenas a acao idempotente afetada; nao apagar a fila inteira sem exportar o payload.
5. Se a API aceitou a acao, limpar somente itens `synced` e manter falhas para nova tentativa.

## Incidente: falha no provedor IA

1. Confirmar env de `GEMINI_API_KEY`.
2. Confirmar que `/api/gemini-proxy` exige bearer Supabase e retorna 401 para usuario sem sessao.
3. Validar limite/rate limit e erro controlado de quota/config no frontend.
4. Revisar logs de auditoria de decisão IA.

## Incidente: erro de RLS

1. Identificar tabela/policy impactada.
2. Validar `auth.uid() = user_id` nas policies.
3. Corrigir migration incremental (nunca editar histórico aplicado em produção).

## Incidente: CORS ou redirect suspeito

1. Conferir `APP_URL`, `CORS_ALLOWED_ORIGINS`, `API_ALLOWED_ORIGINS` e `OAUTH_REDIRECT_ALLOWED_ORIGINS`.
2. Confirmar que a API nao esta ecoando origem fora da allowlist.
3. Para Stripe, validar se `success_url`, `cancel_url` e `return_url` usam origem confiavel.

## Incidente: Sentry sem eventos

1. Conferir `VITE_SENTRY_DSN` no ambiente de preview/staging.
2. Conferir `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_RELEASE` e `SENTRY_DEPLOY_ENV` no build.
3. Gerar erro controlado em staging e confirmar evento com release e sourcemap.

## Validacao DT-001: preflight e smoke real de staging

1. Confirmar que os secrets obrigatorios do workflow `Vercel Preview` existem por nome no GitHub Actions, sem imprimir valores.
2. Nao iniciar preview se algum secret obrigatorio estiver ausente; o workflow falha cedo na etapa `Validate required secrets`.
3. Executar o workflow manual `Vercel Preview` contra o ref desejado.
4. Validar que o log de deploy registrou uma `Preview URL` HTTPS da Vercel.
5. Confirmar no mesmo run que `npm run preflight:sprint3` terminou com `PASS sprint3 preflight`.
6. Confirmar no mesmo run que `SPRINT3_SMOKE_STRICT=true npm run smoke:sprint3` passou com `PASS supabase-rls`, `PASS gemini` e `PASS stripe`.
7. Registrar somente a URL publica de preview, IDs dos jobs/runs e status PASS/FAIL/BLOCKED; nunca copiar tokens, keys, JWTs, service role ou headers de autorizacao para docs, issues ou PRs.

## Incidente: falha ao salvar treino

1. Verificar eventos `workout_save_failed` e erros Sentry no horario do usuario.
2. Confirmar se a sessao existe no Supabase ou fallback local.
3. Se salvou sem recomendacao, manter o historico e reprocessar a recomendacao manualmente somente apos validar dados.
4. Se perdeu dados, pausar convites e acionar rollback.

## SLOs iniciais

- API autenticada: 99,5% de respostas abaixo de 2s em janelas semanais.
- Gemini proxy: 99% de respostas controladas abaixo de 30s, incluindo fallback de erro 502.
- Billing entitlement: 99,9% de disponibilidade, pois bloqueia acesso premium.
- Compliance export/erasure: 99% de sucesso em ate 60s, com falhas revisadas manualmente no mesmo dia util.
