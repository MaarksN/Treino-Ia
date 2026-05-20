# P9 — Redaction & Sensitive Data Review

| Campo sensível | Redigido? | Onde | Risco restante | Próxima ação |
|---|---|---|---|---|
| authorization / bearer | Sim | `api/_lib/redact.ts`, `api/_lib/http.ts`, testes em `api/_lib/redact.test.ts` | Header ainda pode existir em logs de infraestrutura fora da app. | Garantir masking também no provedor de hosting quando habilitado. |
| access_token / refresh_token | Sim | `api/_lib/redact.ts`, `api/_lib/oauthTokenSecurity.ts` | Erros externos podem conter texto livre. | Manter `redactOAuthTokenPayload` em qualquer novo throw/log de OAuth. |
| apiKey / password | Sim | `api/_lib/redact.ts` | Cobertura depende uso consistente do helper. | Exigir checklist de review para novos logs. |
| email / cpf / phone | Sim | `api/_lib/piiRedaction.ts`, `api/_lib/redact.ts` + testes | Regex pode não cobrir 100% formatos internacionais. | Expandir bateria de testes PII em P10. |
| base64 / image/photo payload | Sim | `api/_lib/redact.ts`, `api/_lib/piiRedaction.test.ts` | Payloads grandes ainda podem gerar custo de serialização antes de truncar. | Manter limite de bytes e truncamento atuais. |
| prompt sensível | Parcial | `api/gemini-proxy.ts` evita logging de body | Serviços de cliente podem ainda ter `console.error` em parse de resposta. | Revisar logs de cliente IA em fase futura sem refactor amplo. |
| OAuth code / state | Parcial | Fluxo OAuth não loga diretamente code/state | Query string pode vazar fora da app (infra/proxy). | Reforçar sanitização em edge/proxy e políticas de access logs. |
| cookie / session | Sim (app) | `handleApiError` redige campos sensíveis | Não auditado provider de borda. | Validar configuração de logs no ambiente de deploy. |

## Conclusão
A base atual já possui helpers de redaction e testes relevantes; nesta P9 não foi necessária alteração de código para redaction.
