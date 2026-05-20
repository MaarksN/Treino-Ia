# P9 — Critical Signals Matrix

| Sinal | Fonte | Severidade | Deve alertar? | Dados proibidos | Status |
|---|---|---|---|---|---|
| API 5xx | `api/_lib/http.ts` + logs de runtime | SEV1/SEV2 | Sim | token, password, cookies, stack com segredos | Parcial (sem provider externo) |
| API 4xx em rotas sensíveis | `api/health/oauth/*`, `api/stripe/*`, `api/gemini-proxy.ts` | SEV2/SEV3 | Sim (limiar) | authorization, code, state, PII | Parcial |
| OAuth callback failure | `api/health/oauth/callback.ts` | SEV1/SEV2 | Sim | OAuth code, access/refresh token | Parcial |
| Open redirect attempt bloqueado | `api/_lib/oauthRedirect.ts`, `api/health/oauth/start.ts` | SEV2 | Sim | URL com query sensível | Parcial |
| Gemini proxy failure | `api/gemini-proxy.ts` (status >= 500/502) | SEV2 | Sim | prompt, inlineData/base64 | Parcial |
| Gemini timeout | `fetchWithTimeout` via proxy | SEV2 | Sim | payload IA completo | Parcial |
| Telemetry rejected/redacted | `api/telemetry/errors.ts`, `api/_lib/piiRedaction.ts` | SEV3 | Sim (spike) | userAgent bruto com PII eventual, metadata sensível | Parcial |
| PWA cache API blocked | frontend SW/runtime logs | SEV3 | Sim (quando recorrente) | dados offline do usuário | Pendente |
| Billing guard triggered | `api/_lib/billing*.ts`, `api/stripe/*` | SEV2 | Sim | customer identifiers sensíveis, secrets | Parcial |
| Auth/session failure | `requireSupabaseUser` callers | SEV2 | Sim (limiar) | Authorization header | Parcial |
| Unhandled frontend error | `src/utils/errorTelemetry.ts` | SEV2/SEV3 | Sim (limiar) | email, phone, cpf, prompt, image/base64 | Parcial |
| Build/runtime env missing | `requireEnv` | SEV1 em produção | Sim imediato | valores de env | Parcial |
