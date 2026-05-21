# Rollback Rehearsal Decision

| Tipo de rehearsal | Permitido? | Ambiente | Risco | Escolhido? | Motivo |
|---|---|---|---|---|---|
| Producao real | NAO | Producao | Alto | NAO | Nao ha aprovacao explicita para rollback destrutivo ou deploy action em producao. |
| Staging/preview | NAO CONFIRMADO | Staging/preview nao fornecido | Medio | NAO | Nao ha URL, permissao de deploy, owner ou release window autorizada no escopo desta sprint. |
| Dry-run operacional | SIM | Clone local | Baixo | SIM | Permite validar checkout do commit seguro, gates locais e retorno ao HEAD atual sem afetar usuarios, dados ou deploy. |
| Documental apenas | SIM | Documentacao | Baixo | NAO | Insuficiente para a sprint, pois nao gera evidencia operacional de checkout/validacao. |

## Decisao
O rehearsal escolhido foi `Dry-run operacional`.

## Justificativa
Os artefatos de P12 e post-launch stabilization exigem aprovacao explicita, release window, deploy provider e confirmacao do artifact N-1 antes de qualquer rollback real. Esses dados nao estavam autorizados nesta sprint. O dry-run operacional foi executado para produzir evidencia realista de readiness sem tocar producao.

## Guardrails aplicados
- Nenhum rollback de producao executado.
- Nenhum deploy acionado.
- Nenhum dado apagado.
- Nenhuma secret lida, alterada ou documentada.
- Nenhuma migration criada.
- Nenhum provider externo adicionado.
