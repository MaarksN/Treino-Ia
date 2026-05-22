# OAuth Smoke Results

| Caso | Executado? | Resultado | Evidencia | Observacao |
|---|---|---|---|---|
| OAuth start | Nao, real bloqueado; auditoria estatica executada | `BLOCKED WITH EVIDENCE` | `api/health/oauth/start.ts` exige usuario, provider permitido, client id, state aleatorio, redirect sanitizado e Supabase. Env OAuth/Supabase ausente. | Nenhum redirect real para provider foi gerado nesta sprint. |
| OAuth callback | Nao, real bloqueado; auditoria estatica executada | `BLOCKED WITH EVIDENCE` | `api/health/oauth/callback.ts` exige state valido, troca code somente apos state, cifra token e redireciona sem expor token/code. Env OAuth/Supabase/encryption ausente. | Nenhum code/token real foi recebido ou processado. |
| redirectTo invalido | Sim, audit/test existente | `PASS (AUDIT/TEST)` | `api/_lib/oauthRedirect.ts` + `api/_lib/oauthRedirect.test.ts` rejeitam origem externa, `javascript:` e valor malformado. | Sem chamada externa. Validacao limitada ao helper existente. |
| state ausente/invalido | Sim, auditoria estatica | `PASS/PARTIAL (AUDIT)` | Callback retorna 400 para state ausente e consulta state nao consumido/nao expirado antes do token exchange. | Branch de erro do provider nao consome state; registrar como hardening antes de smoke real. |
| erro seguro | Sim, audit/test existente | `PASS (AUDIT/TEST)` | `api/_lib/http.ts` retorna 500 generico com `requestId`; `api/_lib/http.test.ts` confirma que mensagem interna nao vaza no body. | 4xx mantem mensagens funcionais; mensagens OAuth auditadas nao contem code/token/state. |
| redaction de code/token/state | Sim, audit/test existente | `PASS (AUDIT/TEST)` | `api/_lib/redact.ts`, `api/_lib/redact.test.ts`, `api/_lib/oauthTokenSecurity.test.ts` e `src/utils/errorTelemetry.ts` redigem token/code/state em strings, metadata e telemetria. | Redaction nao substitui a proibicao de logar segredo bruto em novas rotas. |

## OAuth Result

`BLOCKED WITH EVIDENCE`.

OAuth sandbox real nao foi validado porque nao havia ambiente autorizado nem secrets fora do repo. A sprint reduziu risco por auditoria de guards e por documentar o bloqueio sem mascarar como PASS.
