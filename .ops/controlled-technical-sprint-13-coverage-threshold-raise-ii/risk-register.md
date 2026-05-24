# Risk Register - Controlled Technical Sprint 13

| Risco | Severidade | Status anterior | Status apos sprint | Mitigacao | Proxima acao |
|---|---|---|---|---|---|
| Threshold agressivo | Alto | Thresholds em 27/23/27/27, com margem pequena para elevar inteiros. | Mitigado. Novos thresholds ficam abaixo do resultado real com margem >= 0.30 pp. | Usar decimais conservadores e validar `npm run test:coverage`. | Reavaliar apenas depois de novo ganho real de coverage. |
| Coverage flake | Medio | Suite longa e coverage perto do gate. | Monitorar. | Margem conservadora e sem retries artificiais. | Acompanhar CI e futuras variacoes. |
| Exclusoes indevidas | Alto | Gate dependia do escopo existente. | Mitigado. | Nenhum include/exclude/provider/reporter alterado. | Revisar diffs de config em futuras sprints. |
| CI runtime | Medio | CI roda lint/typecheck/test/build/e2e/coverage em jobs separados. | Preservado. | CI nao alterado; coverage continua com `npm run test:coverage`. | Monitorar tempo de jobs conforme testes crescem. |
| Branches ainda baixas | Medio | Branches em 23.59%. | Remanescente. | Threshold subiu para 23.20 sem agressividade. | Priorizar testes de branches em hooks/services pequenos. |
| Componentes complexos sem cobertura | Medio | Muitos componentes grandes seguem com 0%. | Remanescente. | Fora do escopo desta sprint. | Sprint futura de componentes complexos ou fluxos isolados. |
| Hooks complexos sem cobertura | Medio | `useCheckinManager` e `useWorkoutManager` seguem baixos. | Remanescente. | Hooks React Query menores ja cobertos nas Sprints 11/12. | Complex Hook Test Expansion. |
