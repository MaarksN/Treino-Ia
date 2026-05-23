# Risk Register

| Risco | Severidade | Status anterior | Status após sprint | Mitigação | Próxima ação |
|---|---|---|---|---|---|
| Threshold agressivo | Médio | Mitigado | Mitigado | Novo threshold foi definido ~0.5% abaixo do resultado real (ex: branches 23% vs 23.49%) garantindo que flutuações não quebrem a CI. | Elevar thresholds em +5% no futuro somente quando suportado por novo coverage. |
| Coverage flake | Baixo | Mitigado | Mitigado | Global `testTimeout` em 15s em `vitest.config.ts` permanece ativo. | Monitorar eventuais timeouts de coverage local/CI. |
| Exclusões indevidas | Alto | Mitigado | Mitigado | Configuração `exclude` foi preservada intocada, prevenindo mascaramento de resultados. | Nenhuma mudança no escopo excluído sem justificação de negócios. |
| CI runtime | Baixo | Baixo | Baixo | Job coverage no `.github/workflows/ci.yml` preservado. | Monitorar tempo total do Workflow. |
| Branches ainda baixas | Médio | Médio | Médio | A meta provisória era 24%, mas limitou-se a 23% para não exceder a realidade. | Escrever testes direcionados a lógicas condicionais complexas na próxima sprint técnica. |
| Componentes complexos sem cobertura | Alto | Alto | Alto | Não atacado. | Expansão de cobertura de React Components. |
| Hooks complexos sem cobertura | Alto | Alto | Alto | Parcialmente atacado (Sprints 08 e 09). | Continuar expansão com infraestrutura TanStack Query/Zustand. |