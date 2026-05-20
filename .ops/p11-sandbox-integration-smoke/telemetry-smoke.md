# Telemetry / Redaction Smoke

| Caso | Resultado | Evidência | Observação |
|---|---|---|---|
| Authorization redigido | PASS | redaction por chave/conteúdo em helpers | aplicado no pipeline API/telemetry |
| Tokens redigidos | PASS | regex + chave sensível (`token`, `access_token`, etc.) | sem vazamento em logs sanitizados |
| email/phone/cpf redigidos | PASS | regras específicas de PII na redaction | cobertura explícita |
| payload grande truncado | PASS | limite serializado + preview truncado | evita logs excessivos |
| 500 genérico | PASS | `handleApiError` retorna `Internal server error` + requestId | sem detalhes internos |
| requestId preservado | PASS | requestId gerado em erros 500 | rastreabilidade operacional |
