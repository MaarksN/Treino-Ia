| Candidato | Tipo | Requer provider? | Requer API? | Requer storage/browser? | Side effects? | Estado complexo? | Testável agora? | Escolhido? | Motivo |
|---|---|---|---|---|---|---|---|---|---|
| `useAppNavigation` | Hook + store | Não | Não | Não | `useEffect` inicializa store | Baixo | Sim | SIM | Exercita hook real conectado ao `viewStore`, com reset simples e asserts de navegação. |
| `useAuthState` | Hook | Não | Não | Não | Subscription/unsubscribe mockável | Baixo | Sim | SIM | Cobre eventos `SIGNED_IN`/`TOKEN_REFRESHED` e cleanup sem Supabase real. |
| `useTrainingSync` | Hook + store + service | Não | Não real | LocalStorage resetado | Service async mockado | Médio | Sim | SIM | Cobre hidratação/migração mockada do estado global sem chamar Supabase. |
| `useCheckinManager` | Hook | Sim, React Query | Sim, via health/gamification services | Storage indireto | Mutation, refetch, telemetry | Alto | Parcial | NÃO | Exige provider QueryClient e mocks extensos; risco melhor tratado em sprint dedicada. |
| `useWorkoutManager` | Hook | Não | Sim, via services mockáveis | LocalStorage/navigator | Offline queue, gamification, snapshot | Alto | Parcial | NÃO | Tem muitos side effects combinados e merece recorte dedicado. |
| `useDailyCheckinsQuery` | Hook React Query | Sim | Mockável | Não | Query cache | Médio | Sim, com wrapper | NÃO | Deixado para sprint de QueryClient hooks. |
| `useSaveDailyCheckinMutation` | Hook React Query | Sim | Mockável | Não | Mutation + invalidation | Médio | Sim, com wrapper | NÃO | Deixado para sprint de QueryClient hooks. |
| `useRestTimer` | Hook timer | Não | Não | LocalStorage/timers | `setInterval` | Médio | Sim | NÃO | Bom candidato futuro para fake timers; fora do limite de 1 a 3 alvos. |
