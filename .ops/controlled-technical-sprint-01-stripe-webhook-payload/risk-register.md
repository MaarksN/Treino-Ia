# Risk Register - Controlled Technical Sprint 01

| Risco | Severidade | Status anterior | Status apos sprint | Mitigacao | Proxima acao |
|---|---|---|---|---|---|
| Payload bruto completo | Alta | OPEN | REDUCED | `recordStripeWebhookEvent` agora persiste payload minimizado por allowlist. | Manter teste para evitar regressao. |
| PII de cliente | Alta | OPEN | REDUCED | Email/nome/phone/address nao entram no payload minimizado. | Revalidar em sandbox real antes de producao. |
| Metadata livre | Alta | OPEN | REDUCED | `metadata` nao e persistido; processamento usa original em memoria quando necessario. | Documentar qualquer excecao futura. |
| Replay bruto | Media | OPEN | ACCEPTED RISK | Replay completo removido intencionalmente do payload persistido. | Se necessario, criar storage seguro separado com aprovacao de privacidade. |
| Compatibilidade com billing store | Alta | OPEN | REDUCED | Deduplicacao `id`/`23505` preservada; subscription update testado. | Validar com Stripe sandbox quando secrets existirem. |
| Auditoria minima | Media | OPEN | REDUCED | Mantidos id/type/created/livemode/requestId/object ids/status/price/amount/currency. | Revisar campos minimos apos sandbox real. |
| Webhook real Stripe | Alta | BLOCKED WITH EVIDENCE | INALTERADO | Nenhum Stripe real executado; testes locais cobrem helper/store. | Executar sandbox autorizado em sprint propria. |
| Secrets Stripe | Alta | BLOCKED WITH EVIDENCE | INALTERADO | Nenhum secret usado/logado/commitado. | Provisionar fora do repo quando autorizado. |
