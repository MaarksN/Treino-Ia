| Risco | Severidade | Status anterior | Status após sprint | Mitigação | Próxima ação |
|---|---|---|---|---|---|
| Hooks com side effects | Alto | Ativo | Reduzido | `useAuthState` e `useTrainingSync` cobertos com mocks e cleanup/error path | Cobrir `useCheckinManager` e `useWorkoutManager` em recortes próprios |
| Stores globais sem reset | Médio | Mitigado na Sprint 08 | Mitigado | Reset de `viewStore` e `useAppStore` aplicado em testes de hooks | Manter padrão em novas suítes |
| localStorage/sessionStorage | Médio | Parcial | Reduzido | `localStorage.clear()` em testes de store/sync; fixture redaction estabilizado | Cobrir hooks com storage direto (`useRestTimer`, `useWorkoutManager`) |
| Timers/fake timers | Médio | Ativo | Ativo | Não escolhido para evitar exceder limite de alvos | Sprint futura para `useRestTimer` com fake timers |
| Mocks de services | Médio | Parcial | Reduzido | `authService`, `legacyTrainingSyncService` e `errorTelemetry` mockados sem rede real | Padronizar para React Query hooks |
| Coverage threshold | Médio | PASS em 27.02/23.32/27.21/26.84 | Melhorado | Coverage subiu para 27.46/23.49/27.77/27.27 | Avaliar raise progressivo em sprint 10 |
| E2E flakiness | Baixo | 16/16 PASS | Preservado | Specs E2E não alterados | Monitorar |
| Componentes grandes | Alto | Ativo | Ativo | Hooks de base agora mais testáveis | Usar mocks de hooks/stores antes de testar Dashboard/ActiveWorkoutView |
| Test timeout sob coverage | Médio | Flaky em validação inicial | Reduzido | `testTimeout` Vitest aumentado para 15s, thresholds preservados | Monitorar duração da suíte |
