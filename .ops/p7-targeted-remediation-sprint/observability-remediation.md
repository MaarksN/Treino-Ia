# P7 — Observability/Logging Remediation

## Escopo
Auditoria objetiva de logging/telemetria/redaction e validação local sem provider externo.

## Checklist validado

| Controle | Evidência | Status |
|---|---|---|
| Resposta 500 genérica para cliente | `handleApiError` retorna `Internal server error` e `requestId` | OK |
| requestId em erro interno | `handleApiError` gera `crypto.randomUUID()` para 500 | OK |
| No-store para respostas de API | helper `json()` define `cache-control: no-store` | OK |
| Redaction de erro antes de logar | `redactSensitiveData(...)` aplicado em erros HTTP 500 e inesperados | OK |
| Limite de payload em telemetria | `/api/telemetry/errors` com `MAX_TELEMETRY_BODY_BYTES` e máximo de 50 eventos | OK |
| Rate-limit para cliente anônimo | bucket em memória com janela e limite por minuto | OK |
| Origem para telemetria anônima | `enforceSameOriginTelemetry` valida `origin`/`host` ou allowlist | OK |
| Não persistir conteúdo não sanitizado | sanitização de `message`, `stack`, `url`, `metadata`, `userAgent` | OK |
| Não cachear `/api/*` no service worker | bypass explícito por pathname `/api/` | OK |

## Riscos e limites aceitos nesta sprint
- Sem provider de observability externo aprovado (Sentry/PostHog operacional) nesta fase.
- Rate limit em memória é por instância; controle distribuído permanece follow-up.
- Não houve OAuth/billing smoke real por falta de credenciais/autorização.
