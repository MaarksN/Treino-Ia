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

## Incidente: falha ao salvar treino

1. Verificar eventos `workout_save_failed` e erros Sentry no horario do usuario.
2. Confirmar se a sessao existe no Supabase ou fallback local.
3. Se salvou sem recomendacao, manter o historico e reprocessar a recomendacao manualmente somente apos validar dados.
4. Se perdeu dados, pausar convites e acionar rollback.
