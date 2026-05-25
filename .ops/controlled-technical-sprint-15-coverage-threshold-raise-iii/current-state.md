# Controlled Technical Sprint 15 - Current State

## Base

| Area | Estado atual | Evidencia | Risco | Acao nesta sprint |
|---|---|---|---|---|
| Branch base | `origin/main` em `2949f2d` | `Merge pull request #107` | Baixo | Criar worktree limpo |
| Sprint 14 | Fechada na main | Merge commit `2949f2ddcb3c71a640457aca3f76359a3582eb09` | Baixo | Usar coverage pos-Sprint 14 |
| Worktree principal | Contem mudancas locais nao relacionadas | `git status --short` no workspace principal mostrou arquivos modificados | Medio | Nao tocar no workspace principal |
| Worktree Sprint 15 | Limpo | `git status --short` sem saida antes das edicoes | Baixo | Alterar somente thresholds e evidencias |
| Threshold atual | `27.3 / 23.2 / 27.7 / 27.2` | `vitest.config.ts` | Medio se elevado sem margem | Elevar com base em coverage real |
| Coverage gate | Real | `.github/workflows/ci.yml` usa `npm run test:coverage` | Alto | Preservar CI |
| Scripts | `test:coverage` executa `vitest run --coverage` | `package.json` | Alto | Nao alterar scripts |

## Coverage real capturado

Fonte: `coverage/coverage-summary.json` apos `npm run test:coverage`.

```txt
Statements: 29.46
Branches:   25.13
Functions:  29.31
Lines:      29.42
```

## Validacao inicial

```txt
git diff --check: PASS
npm run lint: PASS
npm run typecheck: PASS
npm test: PASS, 179 files, 693 tests
npm run build: PASS
npm run test:e2e: first run failed due preview server ERR_CONNECTION_REFUSED after 14/16; rerun PASS, 16/16
npm run test:coverage: PASS, 29.46 / 25.13 / 29.31 / 29.42
```

