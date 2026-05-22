# OAuth Current State

| Area | Arquivo | Estado atual | Risco | Acao nesta sprint |
|---|---|---|---|---|
| OAuth start | `api/health/oauth/start.ts` | Endpoint `POST` exige usuario Supabase, restringe provider a `google_fit`, `fitbit` ou `strava`, cria `state` aleatorio, aplica `sanitizeRedirectTarget` e grava `health_oauth_states` com expiracao de 10 minutos. | Smoke real depende de Supabase service role, client id do provider, redirect allowlist e ambiente autorizado. Nenhuma dessas variaveis estava configurada na sessao. | Auditoria estatica concluida. Smoke real bloqueado sem credenciais sandbox autorizadas. |
| OAuth redirect | `api/_lib/oauthRedirect.ts` | `sanitizeRedirectTarget` aceita URL relativa ou origem permitida por `baseUrl`/`OAUTH_REDIRECT_ALLOWLIST`; rejeita origem externa, `javascript:` e valores com espaco. | Allowlist de redirect nao configurada no ambiente da sprint; provider-side allowlist tambem nao foi fornecida. | Validado por auditoria e teste existente `api/_lib/oauthRedirect.test.ts`. |
| OAuth callback | `api/health/oauth/callback.ts` | Endpoint `GET` exige `state`, busca estado nao consumido e nao expirado, sanitiza `redirect_to`, troca `code` por token somente apos validar state, criptografa tokens e consome state no sucesso. | Sem Supabase/OAuth secrets/encryption key nao ha callback real. Branch de erro do provider registra erro e redireciona sem consumir state, o que merece hardening antes de smoke real amplo. | Auditoria estatica concluida. Bloqueio real documentado. |
| OAuth token storage | `api/_lib/oauthTokenCrypto.ts`, `api/_lib/oauthTokenSecurity.ts` | Tokens sao cifrados com AES-256-GCM quando `HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY` existe; modo de seguranca nao configurado retorna warning e `plaintext_blocked` bloqueia persistencia. | `OAUTH_TOKEN_SECURITY_MODE` e `HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY` estavam ausentes, entao nao ha caminho seguro para persistir token real nesta sessao. | Sem execucao OAuth real. Risco mantido aberto ate provisionamento seguro. |
| Error handling | `api/_lib/http.ts` | `HttpError` 500 e erros inesperados retornam mensagem generica com `requestId`; logs passam por `redactSensitiveData`. | 4xx retornam mensagens funcionais. As mensagens OAuth auditadas nao incluem code/token/state, mas devem continuar revisadas antes de smoke real. | Validado por auditoria e teste existente `api/_lib/http.test.ts`. |
| Redaction backend | `api/_lib/redact.ts` | Redige `authorization`, token, secret, cookie, session, `code`, `state`, email, CPF, telefone, prompt e dados de imagem/base64 em objetos e strings. | Cobertura existe, mas a redaction nao substitui a regra de nao logar segredo bruto em novas rotas. | Validado por auditoria e testes existentes. |
| Redaction frontend | `src/utils/errorTelemetry.ts` | Telemetria local aplica redaction de observability em message, stack, source, userAgent, url e metadata antes de persistir/enviar. | Flush pode incluir Authorization bearer para API propria; o valor nao e persistido no evento sanitizado, mas headers continuam sensiveis em runtime. | Auditoria estatica concluida. Nenhum envio externo adicionado. |

## Environment Check

Todos os itens abaixo estavam `MISSING` na sessao local, sem valores impressos:

- `APP_URL`
- `OAUTH_REDIRECT_ALLOWLIST`
- `GOOGLE_FIT_CLIENT_ID`
- `GOOGLE_FIT_CLIENT_SECRET`
- `FITBIT_CLIENT_ID`
- `FITBIT_CLIENT_SECRET`
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `OAUTH_TOKEN_SECURITY_MODE`
- `HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Conclusion

OAuth esta implementado com guards relevantes, mas o smoke sandbox real ficou bloqueado por ausencia de ambiente autorizado, secrets fora do repo, allowlist e chave de criptografia. Nenhum OAuth real foi executado.
