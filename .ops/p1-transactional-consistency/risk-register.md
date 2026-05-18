# Risk Register

| Risco | Status | Mitigação nesta fase | Próxima ação |
|---|---|---|---|
| Race condition multi-instância | Mitigado (parcial) | Endpoint recusa duplicidade sequencial, mas concorrência pura falharia na validação `maybeSingle()`. | Implementar transação PL/pgSQL RPC para gamificação. |
| Idempotência parcial | Resolvido | Criado `idempotency.ts` padronizando as chaves e checagem diária determinística. | Monitorar logs para rejeições 409. |
| RPC transacional futura | Documentado | Comentários e arquivos follow-up criados listando requisitos. | Criar migration com RPCs transacionais na fase adequada. |
| Fallback local | Resolvido | Helper retorna tipo `local_fallback` explícito. | - |
| Plano atual atômico | Resolvido | Fallbacks e falhas informam o chamador e a UI reflete via aviso. | - |
