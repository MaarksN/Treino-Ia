# Controlled Technical Sprint 14 - Target Selection

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
