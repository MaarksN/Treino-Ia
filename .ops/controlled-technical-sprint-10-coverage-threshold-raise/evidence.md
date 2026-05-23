# Sprint Evidence

## 1. Objetivo
Aumentar os thresholds de coverage de forma progressiva e conservadora baseada nos resultados reais das Sprints 08/09, sem ultrapassar o baseline ou introduzir instabilidade na CI.

## 2. Base Auditada
Commit: c3854b7 Expand hooks and stores test coverage (Controlled Technical Sprint 09)
Filial: main

## 3. Threshold anterior
Statements: 25%
Branches: 20%
Functions: 25%
Lines: 25%

## 4. Resultado real atual
Statements: 27.47%
Branches: 23.49%
Functions: 27.80%
Lines: 27.28%

## 5. Novo threshold definido
Statements: 27%
Branches: 23%
Functions: 27%
Lines: 27%

## 6. Config alterada
Arquivo `vitest.config.ts` teve a seção `thresholds` do objeto `coverage` modificada via Git Merge Diff. Exclusões (`exclude`) foram mantidas rigorosamente idênticas para não corromper medições reais.

## 7. CI confirmado
O pipeline GitHub Actions `.github/workflows/ci.yml` foi auditado e tem a checagem com falha dura se o coverage não passar. Continua rodando de forma impeditiva.

## 8. Comandos executados
`git diff --check`
`npm run lint`
`npm run typecheck`
`npm test`
`npm run build`
`npm run test:e2e`
`npm run test:coverage`

## 9. Resultado real dos comandos
Todos retornaram PASS (exit code 0). Os gates de coverage foram respeitados pelo novo limite estipulado.

## 10. Riscos remanescentes
- Crescimento das métricas de coverage em branches e functions precisa de foco contínuo. 23% para branches ainda é um valor baixo, apesar da elevação contínua.
- Complexos Hooks e Componentes de UI continuam como principais ofensores nos pontos não cobertos.

## 11. Próxima ação
- Expandir a cobertura focando em React Components / React Query test harness (Controlled Technical Sprint 11).