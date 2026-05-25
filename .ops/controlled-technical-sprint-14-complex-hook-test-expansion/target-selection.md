# Controlled Technical Sprint 14 - Target Selection

<<<<<<< HEAD
## Candidate Review

| Target | Location | Complexity | External risk | Testability | Chosen? | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| `useCheckinManager` | `src/hooks/useCheckinManager.ts` | Query result application, save mutation, store writes, telemetry, gamification side effect | No real network when hooks/services are mocked | High | Yes | Covered previously at 0%; has meaningful state, error and side-effect paths. |
| `useWorkoutManager` | `src/hooks/useWorkoutManager.ts` | Zustand store writes, workout completion side effects, offline queue, snapshot save | No real backend when services/utilities are mocked | High | Yes | Covered previously at 0%; central hook with multiple side effects and fallback paths. |
| `useRestTimer` | `src/pages/Dashboard/hooks/useRestTimer.ts` | Timers, persisted localStorage state, interval cleanup, expiry | Browser localStorage only | High | Yes | Mentioned target; fake timers allow deterministic coverage without real browser services. |
| `useProgressionSuggestion` | `src/hooks/useProgressionSuggestion.ts` | Effects plus progression services and feedback store | Pre-existing dirty file in worktree | Medium | No | Avoided to preserve unrelated local changes. |
| `useApplyProgressionSuggestion` | `src/hooks/useApplyProgressionSuggestion.ts` | Store and progression mutation behavior | Pre-existing dirty file in worktree | Medium | No | Avoided to preserve unrelated local changes. |

## Final Selection

Selected targets:

- `src/hooks/useCheckinManager.ts`
- `src/hooks/useWorkoutManager.ts`
- `src/pages/Dashboard/hooks/useRestTimer.ts`

This selection provides real coverage gain for complex hook behavior while avoiding Supabase, OAuth, Billing, Stripe, migrations, schema changes and unrelated dirty files.
=======
| Candidato | Tipo | Storage/timers? | Stores? | Services mockaveis? | Supabase real? | Rede real? | Testavel agora? | Escolhido? | Motivo |
|---|---|---|---|---|---|---|---|---|---|
| `useCheckinManager` | Complex hook | Nao direto | Zustand | Sim, hook/service mocks | Nao | Nao | Sim | Sim | Cobre fluxo de check-in com query/mutation mockadas, store e side effects |
| `useWorkoutManager` | Complex hook | localStorage via contadores e offline path | Zustand | Sim, util/service mocks | Nao | Nao | Sim | Sim | Cobre conclusao de treino, snapshot, badges, offline queue e reset de store |
| `useRestTimer` | Timer hook | localStorage + fake timers | Nao | Sim, engine real ja isolado | Nao | Nao | Sim | Sim | Cobre restauracao, start/stop/reset e expiracao deterministica |
| `useTrainingSync` | Store/service hook | localStorage indireto | Zustand | Sim | Nao | Nao | Sim | Nao | Ja possui cobertura dedicada |
| `useProgressionSuggestion` | Store hook | Nao | Zustand | Regras locais | Nao | Nao | Sim | Nao | Fora do foco principal; PR #105 ja trouxe trilha de progressao |
| React Query hooks pequenos | Query/mutation hooks | Nao | Nao | Sim | Nao | Nao | Sim | Nao | Ja cobertos nas Sprints 11 e 12 |

## Decisao

Escolhidos 3 hooks:

- `useCheckinManager`
- `useWorkoutManager`
- `useRestTimer`

Racional:

- Eram alvos recomendados para Sprint 14.
- Tinham 0% de coverage direta antes da sprint.
- Permitem asserts reais sem rede, sem Supabase real, sem OAuth/Billing e sem runtime product change.
- Exercitam side effects controlados: Zustand, localStorage, fake timers, callbacks, telemetry e servicos mockados.

>>>>>>> codex/sprint-14-complex-hook-test-expansion
