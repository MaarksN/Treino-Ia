| Risco | Mitigação | Próxima ação |
|---|---|---|
| Quebra de import por mover tipos | Re-export de tipos no `database.ts` | Migrar consumidores gradualmente para imports diretos de tipos |
| Regressão visual em dashboard | Refactor limitado a helpers puros sem mudar JSX | Extrair painéis visuais em fases menores com snapshot/UI test |
| Alteração de comportamento de treino | Sem alteração de fluxo; somente extração de funções idênticas | Adicionar testes unitários dedicados dos helpers extraídos |
| Falta de teste UI | Validação por lint/type/test/build existentes | Evoluir suíte de componentes em fase seguinte |
| Circular dependency | `trainingReadModels` passa a depender de `database.types` | Adicionar checagem automatizada de dependências circulares |
| Façade database ainda grande | Extração inicial somente de tipos para reduzir acoplamento | Próxima fase: extrair repositories local/cloud mantendo API |
