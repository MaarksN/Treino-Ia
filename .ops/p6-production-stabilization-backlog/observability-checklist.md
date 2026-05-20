# P6 — Observability Checklist

## Objetivo
Garantir rastreabilidade mínima de incidentes sem expor PII.

## Checklist operacional

- [ ] Logs de erro 5xx com mensagem genérica para usuário final.
- [ ] `requestId`/`correlationId` presentes nos pontos críticos.
- [ ] Redação de PII (tokens, e-mails completos, segredos) aplicada em logs.
- [ ] Alarmes mínimos definidos para taxa de erro e indisponibilidade.
- [ ] Canal de alerta definido (on-call/chat/incident tool).
- [ ] Procedimento de triagem inicial documentado (owner + SLA inicial).
- [ ] Smoke pós-deploy inclui verificação de logs/alertas.

## Evidência esperada em P7

- Captura de evento controlado em ambiente de teste.
- Registro de correlação ponta-a-ponta.
- Evidência de disparo de alerta (ou teste de alerta).
