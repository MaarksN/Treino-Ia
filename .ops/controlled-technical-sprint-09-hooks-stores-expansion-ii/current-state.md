| Área | Arquivo | Estado atual | Risco | Ação nesta sprint |
|---|---|---|---|---|
| Hooks | `src/hooks/useAppNavigation.ts` | Sem teste dedicado; depende de `viewStore` e `useEffect` para inicializar view | Médio | Testar com `renderHook`, store real e reset Zustand |
| Hooks | `src/hooks/useAuthState.ts` | Sem teste dedicado; registra callback de auth e unsubscribe | Médio | Testar com mock de `onAuthStateChange` |
| Hooks | `src/hooks/useTrainingSync.ts` | Sem teste dedicado; hidrata `useAppStore` a partir de service async | Alto | Testar com services mockados, sem Supabase real |
| Hooks | `src/hooks/useCheckinManager.ts` | Sem cobertura; usa React Query, mutation, store, gamification e telemetry | Alto | Não escolhido; exige provider/mocks mais amplos |
| Hooks | `src/hooks/useWorkoutManager.ts` | Sem cobertura; usa store global, localStorage, offline queue, gamification e snapshot | Alto | Não escolhido; exige mock amplo e risco de refactor |
| Hooks | `src/hooks/useDailyCheckinsQuery.ts` | Wrapper de React Query sobre `healthService` | Médio | Não escolhido; melhor cobrir junto de provider QueryClient |
| Hooks | `src/hooks/useSaveDailyCheckinMutation.ts` | Wrapper de mutation/invalidation do React Query | Médio | Não escolhido; melhor cobrir junto de provider QueryClient |
| Stores | `src/stores/useAppStore.ts` | Coberto na Sprint 08 | Reduzido | Reusado em teste de `useTrainingSync` com reset |
| Stores | `src/stores/viewStore.ts` | Coberto na Sprint 08 | Reduzido | Reusado em teste de `useAppNavigation` com reset |
| Test harness | `vitest.config.ts` | Timeout padrão de 5s gerava flakes sob coverage instrumentado | Médio | Aumentar `testTimeout` para 15s sem alterar thresholds |
| Test fixture | `api/_lib/redact.test.ts` | Fixture oversized causava timeout sob coverage mantendo a mesma intenção de teste | Baixo | Reduzir tamanho do fixture mantendo truncation/redaction |
| Test fixture | `tests/geminiProxyHardening.test.ts` | Mock 4xx reutilizava a mesma `Response`, sensível a efeito cascata após timeout | Médio | Criar `Response` nova por chamada |
