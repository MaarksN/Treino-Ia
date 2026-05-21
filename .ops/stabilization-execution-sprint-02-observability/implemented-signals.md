# Stabilization Execution Sprint 02 - Implemented Signals

| Sinal | Implementado nesta sprint? | Fonte | Redaction aplicada? | Alerta real? | Proxima acao |
|---|---|---|---|---|---|
| API 5xx | Parcial, existente | `api/_lib/http.ts` | Sim, via `redactSensitiveData` | Nao | Padronizar `correlationId` e conectar provider aprovado. |
| OAuth callback failure | Parcial, existente | `api/health/oauth/callback.ts` | Parcial, token payload redigido; redaction agora cobre code/state | Nao | Rodar smoke OAuth sandbox e criar alerta real. |
| Open redirect attempt bloqueado | Parcial, existente | `api/_lib/oauthRedirect.ts`, `api/health/oauth/start.ts` | Sim para URLs/eventos redigidos | Nao | Contabilizar tentativas quando provider aprovado existir. |
| Gemini proxy timeout/failure | Parcial, existente | `api/gemini-proxy.ts` | Sim por nao logar prompt/body; redaction cobre prompt/image se virar metadata | Nao | Emitir evento operacional redigido em fase posterior. |
| Telemetry rejected/redacted | Sim, fundacao criada | `src/services/observability/*`, `api/telemetry/errors.ts` | Sim, testes cobrem campos proibidos | Nao | Conectar contador/alerta quando provider aprovado existir. |
| PWA cache API blocked | Nao | Frontend/PWA runtime | Nao aplicavel nesta sprint | Nao | Executar browser smoke e definir evento seguro. |
| Frontend unhandled error | Parcial, existente e reforcado | `src/utils/errorTelemetry.ts` | Sim, agora usa redaction de observability | Nao | Associar release/correlationId quando provider aprovado existir. |
| Billing guard triggered | Parcial, existente | `api/_lib/billing*.ts`, `api/stripe/*` | Sim em erros API genericos; sem evento dedicado | Nao | Criar alerta sandbox/test-mode apos aprovacao. |
| Supabase env missing | Parcial, existente | `api/_lib/http.ts` `requireEnv` | Sim para log interno; usuario recebe 500 generico | Nao | Criar alerta imediato em provider aprovado. |
