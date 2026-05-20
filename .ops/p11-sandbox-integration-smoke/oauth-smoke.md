# OAuth Sandbox Smoke

| Caso | Resultado | Evidência | Observação |
|---|---|---|---|
| OAuth start gera redirect seguro | PASS (audit) | `api/health/oauth/start.ts` usa `sanitizeRedirectTarget`, provider allowlist, state randômico | Sem execução real por ausência de credenciais sandbox autorizadas |
| redirectTo inválido bloqueado | PASS (audit) | `sanitizeRedirectTarget` aplicado no start/callback | fallback seguro esperado para base URL |
| callback não vaza token/code | PASS (audit) | callback não retorna token/code em resposta; usa redirect status apenas | logs usam handlers com redaction |
| state validado | PASS (audit) | consulta `health_oauth_states` por state, expiração e consumed_at | rejeita inválido/expirado |
| erro retorna mensagem segura | PASS/PARCIAL | `handleApiError` retorna 500 genérico com requestId | 4xx mantém mensagem funcional esperada |
| OAuth end-to-end real | BLOQUEADO | sem credenciais OAuth sandbox liberadas nesta sessão | não executado por política de segurança |
