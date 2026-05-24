# Current State - Controlled Technical Sprint 13

| Area | Estado atual | Evidencia | Risco | Acao nesta sprint |
|---|---|---|---|---|
| Base Git | Branch limpa `codex/sprint-13-coverage-threshold-raise` criada de `origin/main`. | `HEAD` em `f0dda8f Merge pull request #103 from MaarksN/sprint-12-react-query-hooks-coverage-ii`; `git pull` retornou `Already up to date`. | Baixo. O workspace original tinha mudancas locais nao relacionadas, preservadas em outro worktree. | Executar Sprint 13 apenas no worktree limpo. |
| Thresholds atuais | Statements 27, Branches 23, Functions 27, Lines 27. | `vitest.config.ts` antes da alteracao. | Medio se os novos thresholds forem definidos acima do coverage real. | Elevar apenas abaixo do resultado real medido. |
| Coverage real atual | Statements 27.67%, Branches 23.59%, Functions 28.09%, Lines 27.52%. | `coverage/coverage-summary.json` gerado por `npm run test:coverage`. | Medio por margem pequena em branches/lines. | Usar thresholds decimais conservadores com margem >= 0.30 pp. |
| CI coverage gate | Job `coverage` executa `npm run test:coverage`. | `.github/workflows/ci.yml`, step `Coverage with threshold gate`. | Baixo; gate real preservado. | Nao alterar CI. |
| Scripts existentes | `test:coverage` aponta para `vitest run --coverage`. | `package.json`. | Baixo. | Nao alterar scripts. |
| Coverage scope | `include` cobre `src/**/*.ts`, `src/**/*.tsx`, `api/**/*.ts`; excludes de testes/main/env/node_modules. | `vitest.config.ts`. | Alto se exclusoes forem ampliadas indevidamente. | Nao alterar include/exclude/provider/reporters. |
| Reports anteriores | `.ops/controlled-technical-sprint-10-coverage-threshold-raise/final-report.md` e `.ops/controlled-technical-sprint-12-react-query-hooks-expansion-ii/final-report.md` nao existem na arvore atual. | `Test-Path .ops` era falso antes desta sprint. | Baixo para a mudanca de config; historico Git confirma merges #101 e #103. | Documentar ausencia e recriar evidencia da Sprint 13. |

## Initial Validation

```txt
git diff --check: PASS
npm run lint: PASS
npm run typecheck: PASS
npm test: PASS - 168 files, 640 tests
npm run build: PASS
npm run test:e2e: PASS - 16 tests
npm run test:coverage: PASS
git status --short: clean before edits
```

## Coverage Summary

```txt
Statements: 27.67% (3183/11500)
Branches: 23.59% (2056/8712)
Functions: 28.09% (960/3417)
Lines: 27.52% (2787/10127)
```
