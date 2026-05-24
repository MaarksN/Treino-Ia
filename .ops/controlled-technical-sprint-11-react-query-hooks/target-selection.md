# Target Selection - Controlled Technical Sprint 11

| Candidato | Tipo | Requer QueryClient? | Requer API real? | Requer Supabase real? | Side effects? | Testavel agora? | Escolhido? | Motivo |
|---|---|---|---|---|---|---|---|---|
| `useDailyCheckinsQuery` | Query hook | Sim | Nao, com service mockado | Nao, com `vi.mock` | Cache/fetch state | Sim | Sim | Pequeno, deterministico, exporta query key e permite validar loading, sucesso, erro e cache sem rede real. |
| `useSaveDailyCheckinMutation` | Mutation hook | Sim | Nao, com service mockado | Nao, com `vi.mock` | Invalidation de cache | Sim | Sim | Pequeno, deterministico e valida chamada do service, estado de mutation, erro e `invalidateQueries`. |
| `useCheckinManager` | Hook consumidor/orquestrador | Sim, indiretamente | Nao, se todos services forem mockados | Nao, se todos services forem mockados | Store, gamification, callbacks, refresh | Parcial | Nao | Maior superficie e multiplos efeitos; melhor para sprint de expansao apos a fundacao QueryClient. |
| `useWorkoutManager` | Hook consumidor sem React Query direto | Nao | Nao, com mocks | Nao, com mocks | Store, analytics, offline queue, PWA sync | Parcial | Nao | Fora do foco React Query desta sprint. |
| `useAuthState` | Hook effect/subscription | Nao | Nao | Nao | Subscription auth mockada | Sim | Nao | Ja coberto por Sprint 09; nao e React Query. |
| `useTrainingSync` | Hook async/store | Nao | Nao | Nao | Store e services mockados | Sim | Nao | Ja coberto por Sprint 09; nao e React Query. |

## Decision

Alvos escolhidos:

```txt
src/hooks/useDailyCheckinsQuery.ts
src/hooks/useSaveDailyCheckinMutation.ts
```

Motivo:

```txt
Ambos sao pequenos, diretos, sem provider profundo alem de QueryClientProvider,
com services mockaveis e assertions reais sobre cache/invalidation.
```

Alvos nao escolhidos:

```txt
useCheckinManager
useWorkoutManager
useAuthState
useTrainingSync
```

Motivo:

```txt
Ou nao sao React Query diretos, ou combinam stores/callbacks/side effects demais
para a fundacao inicial desta sprint.
```
