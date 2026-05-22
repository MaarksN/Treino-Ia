| Risco | Severidade | Status anterior | Status após sprint | Mitigação | Próxima ação |
|---|---|---|---|---|---|
| **Stores globais sem reset** | Médio | N/A | ✅ MITIGADO | Padrão `beforeEach(() => store.setState(initialState, true))` estabelecido nas suítes | Aplicar padrão sempre que mockar zustand stores |
| **Hooks com side effects** | Alto | N/A | 🟡 ATIVO | Não foi coberto nesta sprint para garantir segurança base | Planejar sprint dedicada a refatorar hooks complexos ou mockar network |
| **LocalStorage/SessionStorage** | Médio | N/A | ✅ MITIGADO | `localStorage.clear()` incluso no reset da `useAppStore` test suite | Padronizar limpeza de storage em beforeEach global se necessário |
| **Coverage threshold** | Médio | 26.89% stmts | ✅ MELHORADO | Subiu para 27.03% | Continuar cobertura sistemática |
| **E2E flakiness** | Baixo | 16/16 PASS | ✅ PRESERVADO | 16/16 PASS sem alterações nos specs | Monitorar |
| **Componentes grandes** | Alto | Sem testes | 🔴 ATIVO — escopo futuro | Requerem mock de stores que agora possuem estrutura de teste isolada, facilitando futuro mock | Abordar cobertura de componentes conectados na sprint 09/10 |
