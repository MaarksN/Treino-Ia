# P10 Enablement Decision

| Trilha | Viável? | Bloqueador | Escolhida? | Motivo |
|---|---|---|---|---|
| Playwright / Browser E2E | Não | `npx playwright --version` falhou com `403 Forbidden` ao baixar pacote `playwright` | Não | Dependência base bloqueada por política do ambiente; sem pacote não há execução browser real confiável. |
| Vitest Coverage | Não | `npm install -D @vitest/coverage-v8` falhou com `403 Forbidden` no registry | Não | Provider de coverage indisponível; sem provider não há cobertura percentual real. |

## Decisão P10
Sem trilha implementável neste ambiente atual. A fase foi convertida para **blocked rationale + plano de desbloqueio** com evidência operacional completa e sem implementação falsa.
