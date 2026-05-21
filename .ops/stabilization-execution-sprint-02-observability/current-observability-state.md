# Stabilization Execution Sprint 02 - Current Observability State

| Area | Arquivo | Sinal atual | Risco | Acao nesta sprint |
|---|---|---|---|---|
| Frontend unhandled errors | `src/utils/errorTelemetry.ts` | Captura `window.error` e `unhandledrejection`, persiste localmente e faz flush para `/api/telemetry/errors`. | Metadata pode crescer; redaction dependia de helper API separado. | Reutilizar nova redaction de observability antes de persistir/enviar. |
| Telemetry ingestion | `api/telemetry/errors.ts` | Recebe ate 50 eventos, aplica origem/rate guard e sanitiza mensagem, stack, URL, userAgent e metadata. | Sem provider externo/alerta real; falha de insert vira 500 generico. | Manter runtime sem mudanca ampla; documentar sinal implementavel. |
| API 5xx handling | `api/_lib/http.ts` | 500 retorna mensagem generica com `requestId`; log interno redigido. | `correlationId` ponta-a-ponta ainda parcial; logs dependem de console/runtime. | Documentar gap; nao alterar assinatura de handlers nesta sprint. |
| Shared redaction | `api/_lib/redact.ts` | Redige authorization, tokens, password, email, cpf, phone, imagens data URL e metadata grande. | Campos `prompt`, `code`, `state`, `cookie`, `session`, `secret`, `photo/base64` precisavam cobertura explicita. | Ampliar lista sensivel e cobrir por testes de observability. |
| Gemini provider | `api/gemini-proxy.ts` | Timeout/retry e 502 generico; nao loga body/prompt. | Sem evento operacional dedicado; prompts/imagens sao dados proibidos. | Registrar sinal como parcial e manter prompt fora de telemetria. |
| OAuth start | `api/health/oauth/start.ts` | Gera state e auth URL; bloqueia provider invalido; usa allowlist de redirect. | `state` e `redirectTo` sao sensiveis se vazarem fora da app. | Redaction cobre `state`/`code`; sem provider externo. |
| OAuth callback | `api/health/oauth/callback.ts` | Valida state, troca token, redireciona status; redige payload de token em erro de storage. | OAuth real ainda sem sandbox aprovado; code/state podem aparecer em URL de infra. | Documentar runbook e manter sem smoke real. |
| Gamification API | `api/gamification/event.ts` | Idempotencia e erros genericos via `handleApiError`. | Metadata de ledger nao deve virar log sensivel em falha. | Sem integracao ampla; usar redaction central se virar evento futuro. |
| Health sync | `api/health/sync.ts` | Verifica OAuth token antes de sync e registra job. | Dados de saude/sumario nao devem ser exportados para provider externo. | Nao exportar; manual/internal adapter apenas. |
| Provider externo | `.ops/post-launch-stabilization/observability-provider-plan.md` | Plano avalia Sentry/PostHog/Datadog/BetterStack/Vercel/manual. | Nenhum provider aprovado; alertas reais ausentes. | Escolher Manual/Internal adapter seguro. |

## Extracted Findings
- Sinais criticos esperados: API 5xx, OAuth callback failure, open redirect bloqueado, Gemini timeout/failure, telemetry rejected/redacted, PWA cache API blocked, frontend unhandled error, billing guard, Supabase env missing.
- Dados proibidos: authorization, token, access_token, refresh_token, apiKey, password, email, cpf, phone, base64/image/photo, prompt, OAuth code/state, cookie/session/secret, dados de saude.
- Lacunas requestId/correlationId: `requestId` existe em 500 API; `correlationId` ponta-a-ponta ainda nao e padronizado.
- Status do provider externo: nao aprovado.
- Alertas recomendados: P9 define thresholds e owners, mas nenhum alerta real esta configurado.
- Gaps de redaction: prompt/code/state/cookie/session/secret/photo/base64 precisavam cobertura explicita nesta fase.
