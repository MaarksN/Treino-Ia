# Release Points

| Ponto | Commit | Descricao | Seguro para rollback? | Evidencia |
|---|---|---|---|---|
| Atual | `c8a201d34281bce9255f8830190fbd87d87c4558` | Merge do PR #97, Sprint 02 Observability Provider Approved | N/A - release atual | `git rev-parse HEAD`, `git log --oneline -20` |
| Anterior seguro | `48eabf6d837147faf5812c6de537d492b89832a2` | Primeiro parent do merge `c8a201d`, estado de `main` antes da Sprint 02 | SIM para dry-run local; confirmar artifact N-1 antes de producao | `git rev-parse HEAD^1`, validacao local completa no dry-run |
| Ultimo release gate | `3bd840fc0efee70eb30c56b8bcb9fd54908b070a` | Commit que adicionou status de entrega P12 no historico de release gate | NAO como alvo automatico; referencia historica | `git log --oneline -- .ops/p12-final-production-go-live-gate/release-decision.md` |

## Tags/releases
No formal release tag found.

## Observacoes
- `5c241f83b0c217d4738640c4c79ac9a0e206722d` e o segundo parent do merge atual e corresponde ao commit do PR #97.
- Para rollback real em deploy provider, o commit anterior seguro precisa ser confirmado contra o artifact N-1 publicado pelo provedor de deploy.
- Este sprint nao criou tag, release nem deploy.
