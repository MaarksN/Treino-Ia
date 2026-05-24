# Risk Register - Controlled Technical Sprint 11

| Risco | Impacto | Mitigacao nesta sprint | Status |
|---|---|---|---|
| React Query hooks complexos ainda sem cobertura direta (`useCheckinManager`) | Medio | Fundacao QueryClient criada e dois hooks base cobertos. | Remanescente |
| Mutation invalidation coberta apenas no hook base | Medio | `invalidateQueries` validado no `useSaveDailyCheckinMutation`. Fluxo completo no consumidor fica para expansao. | Remanescente |
| Vazamento de query cache entre testes | Medio | QueryClient novo por teste e `queryClient.clear()` no `afterEach`. | Mitigado |
| Chamada acidental a Supabase/rede real | Alto | `vi.mock('../services/healthService')` nos testes. | Mitigado |
| OAuth/Billing sandbox nao autorizado | Alto | Fora de escopo, sem execucao real de OAuth/Billing. | Remanescente |
| Crescimento de coverage ainda conservador | Baixo | Coverage gate passou e subiu levemente; thresholds nao reduzidos. | Monitorar |
| `npm` ausente no `PATH` base da sessao PowerShell | Baixo | Node/NPM portatil v22.14.0 em `%TEMP%`, com `PATH` temporario por comando. | Mitigado localmente |
