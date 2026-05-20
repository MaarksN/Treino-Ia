# P5 Release Decision

## Decisão

GO WITH WARNINGS

## Motivo

- Qualidade de base local aprovada: `git diff --check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- Não houve falha crítica de build/testes que force `NO-GO`.
- Parte relevante dos smokes funcionais reais depende de browser/credenciais/sandbox e não foi executada neste ambiente.
- Warnings permanecem concentrados em OAuth real, billing sandbox, PWA offline, observabilidade, ensaio de rollback, E2E browser, coverage e CSP.

## Gate de segurança

- Não houve adição de feature.
- Não houve migration/schema change.
- Não houve mudança de dependências.
- Não houve exposição de secret.
