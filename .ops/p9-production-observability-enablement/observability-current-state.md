# P9 — Observability Current State

| Área | Arquivo | Sinal atual | Risco | Ação recomendada |
|---|---|---|---|---|
| API error handling | `api/_lib/http.ts` | `handleApiError` retorna erro genérico 500 com `requestId`; `console.error` usa `redactSensitiveData`. | `access-control-allow-origin: *` em respostas pode facilitar origem ampla; volume de logs sem correlação distribuída. | Manter 500 genérico; evoluir para `correlationId` propagado entre rotas quando houver padrão comum. |
| Frontend telemetry capture | `src/utils/errorTelemetry.ts` | Captura `window.error`/`unhandledrejection`, sanitiza mensagem/url/metadata e flush para `/api/telemetry/errors`. | Persistência em `localStorage` sem envio garantido; ausência de alerta real configurado. | Manter sanitização; adicionar monitoramento operacional de backlog de flush por inspeção manual e alerta futuro no provider aprovado. |
| Telemetry ingestion | `api/telemetry/errors.ts` | Valida tamanho/lote, aplica rate limit anônimo, exige mesma origem para anônimo, sanitiza dados antes de inserir. | Dependência de tabela Supabase e sem alerta automático de falha de insert. | Tratar falha de insert como sinal SEV2 operacional e incluir no plano de alertas. |
| Gemini proxy | `api/gemini-proxy.ts` | Timeout/retry/backoff, respostas 5xx mascaradas genericamente para usuário, sem log de payload. | Falhas externas podem aumentar 502 sem notificação ativa. | Criar alerta recomendado para spike de 502/timeout e acompanhar por logs da plataforma. |
| OAuth start | `api/health/oauth/start.ts` | Gera `state` randômico, valida provider, sanitiza `redirectTo`. | Falha de insert de state depende só de erro 500 genérico, sem métrica dedicada. | Incluir sinal crítico "OAuth callback/start failure" com owner explícito. |
| OAuth callback | `api/health/oauth/callback.ts` | Valida state/expiração, redige payload de erro de token, warning explícito para armazenamento de token. | `console.warn` operacional não conectado a alertas; risco de falhas silenciosas sem triagem rápida. | Mapear warning/erro no runbook e alerta recomendado para aumento de falhas callback. |
| Health sync | `api/health/sync.ts` | Fluxo com `handleApiError`; falhas retornam padrão seguro. | Sem endpoint `/api/health` e `/api/ready` dedicados atualmente. | Documentar lacuna e recomendar rotas mínimas na P10 (sem implementar agora). |
| Gamification API | `api/gamification/event.ts` | Erros internos encapsulados por `handleApiError`; metadata enviada ao RPC é de negócio (sem token). | Potencial risco de inserir metadata excessiva não padronizada se chamada evoluir. | Reforçar checklist de não incluir PII em metadata de eventos. |

## Achados de auditoria por busca textual
Comando executado: `rg -n "console\\.log|console\\.error|console\\.warn|throw new Error|requestId|correlationId|telemetry|errorTelemetry|redact|metadata|stack|userAgent" src api`.

- Não foram encontrados `console.log` sensíveis nos arquivos auditados de backend crítico.
- Foram encontrados `console.warn` e `console.error` em pontos específicos; os fluxos de API auditados usam redaction em erros 500 via `handleApiError`.
- Não foi identificado `correlationId` padronizado ponta-a-ponta nesta fase.
