# AI / Gemini Fallback Smoke

| Caso | Resultado | Evidência | Observação |
|---|---|---|---|
| timeout/retry segue política | PARCIAL | política existente em cliente/proxy e tratamento de erro | sem teste de rede controlado nesta fase |
| fallback não mascarado como sucesso | PASS | fallback determinístico com auditoria `usedDeterministicFallback` | status/auditoria explícitos |
| JSON inválido não aceito | PASS | `safeParseAiJson` + type guards em respostas estruturadas | fallback acionado quando inválido |
| prompt/token não aparece em log | PASS (audit) | redaction e mensagens seguras em erro | sem dump de segredo |
| erro de provider retorna mensagem segura | PASS | proxy usa handler com erro genérico/seguro | sem detalhes sensíveis para cliente |
