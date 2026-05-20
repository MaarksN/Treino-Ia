# P6 — CSP Tightening Plan

## Objetivo
Endurecer CSP progressivamente, minimizando regressões em produção.

## Fases propostas

1. **Inventário de fontes ativas**
   - Mapear `script-src`, `connect-src`, `img-src`, `frame-src`, `style-src` efetivamente usados.
2. **Remoção de curingas desnecessários**
   - Reduzir `*` e origens amplas não essenciais.
3. **Ambiente preview/staging**
   - Aplicar política mais estrita em ambiente controlado e executar smoke browser.
4. **Monitoramento de violações CSP**
   - Coletar e classificar violações antes de promover para produção ampla.
5. **Promoção gradual**
   - Liberar por etapas com rollback pronto.

## Guardrails

- Não remover origem crítica sem smoke dedicado.
- Não promover para produção ampla sem evidência de estabilidade.
- Manter plano de rollback imediato para regressões.
