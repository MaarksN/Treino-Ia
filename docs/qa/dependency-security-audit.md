# Auditoria de Dependencias

Status: PASS local / PARTIAL supply chain

## Resultados

- `npm ci`: instalou 537 pacotes e auditou 538 pacotes; 0 vulnerabilidades.
- `npm audit --json`: `critical=0`, `high=0`, `moderate=0`, `low=0`, total 0.

## Avisos

- `npm ci` com npm 11.16.0 avisou sobre scripts pendentes:
  - `@sentry/cli@2.58.6`
  - `esbuild@0.27.7`
- LHCI via `npm exec @lhci/cli@0.15.x` trouxe avisos de pacotes transientes deprecated (`inflight`, `glob`, `rimraf`, `uuid`) durante execucao da ferramenta externa.

## Riscos residuais

- Nao foi executado SCA alem de `npm audit`.
- Sem SBOM.
- Sem verificacao de assinaturas/provenance.
- Sem lockfile diff porque a auditoria restaurou efeitos colaterais do npm.

## Decisao

PASS para vulnerabilidades npm conhecidas nesta execucao.
PARTIAL para supply chain avancado.
