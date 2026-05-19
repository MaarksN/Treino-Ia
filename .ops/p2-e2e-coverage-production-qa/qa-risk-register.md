| Risco | Status | Cobertura atual | Próxima ação |
|---|---|---|---|
| Billing | Parcial | Testes de handlers/serviços sem checkout real | E2E sandbox Stripe em P3 |
| OAuth | Parcial | Guardrails e handlers sem provedor externo real | Teste contrato com provider mockado avançado |
| PWA | Parcial | Testes de policy/cache em serviço | E2E browser com SW/network assertions |
| IA | Coberto (integração) | Fallback + parser seguro + gateway policy testados | Adicionar smoke E2E de UX de falha IA |
| Gamificação | Parcial | Eventos/serviços/handlers testados (inclui cenários de repetição) | Validar jornada E2E ponta a ponta |
| Treino ativo | Coberto (integração) | Engine/interações/timer/validações cobertas por suíte | E2E visual de fluxo completo |
| Dados sensíveis | Parcial | Redaction/telemetry/security handlers cobertos | Pentest leve de UI + contrato de payload redigido |
| localStorage/offline | Parcial | Isolamento e utils offline em testes | E2E offline mode no browser |
