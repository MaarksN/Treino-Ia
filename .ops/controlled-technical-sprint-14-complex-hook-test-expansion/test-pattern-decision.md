# Controlled Technical Sprint 14 - Test Pattern Decision

<<<<<<< HEAD
## Patterns Used

| Pattern | Used? | Where | Reason |
| --- | --- | --- | --- |
| `renderHook` | Yes | All new hook tests | Exercise hooks through React lifecycle instead of direct function calls. |
| `act` | Yes | Save, complete workout, timer controls | Flush React state updates and async hook actions. |
| `waitFor` | Yes | Async checkin save/refresh and offline queue | Assert eventual async side effects without sleeps. |
| `vi.mock` | Yes | Service, hook and utility boundaries | Prevent real network/backend/browser-provider usage. |
| Zustand reset | Yes | `useAppStore.setState(initialAppStoreState, true)` | Keep store state isolated between tests. |
| `localStorage.clear` | Yes | All suites | Prevent persisted browser state bleed. |
| Fake timers | Yes | `useRestTimer` only | Deterministic interval, expiry and persisted timer checks. |

## Scope Controls

- No production code was changed.
- No thresholds were changed.
- No tests were removed.
- No real Supabase, OAuth, Billing, Stripe or external network calls were used.
- No `expect(true).toBe(true)` or import-only tests were added.
- Tests assert concrete state changes, side effects, storage, fallback/error behavior and callback calls.
=======
## Padrao adotado

| Area | Decisao | Motivo |
|---|---|---|
| Hook harness | `renderHook` + `act` + `waitFor` | Padrao ja usado no repo para hooks React |
| Timers | `vi.useFakeTimers()` e `vi.setSystemTime()` em `useRestTimer` | Torna countdown e expiracao deterministicos |
| Zustand | `useAppStore.setState(initialState, true)` no setup/teardown | Evita vazamento de estado entre testes |
| Storage | `localStorage.clear()` em setup/teardown | Evita cache/storage leakage |
| Services/utilitarios | `vi.mock` com `vi.hoisted` | Garante mocks seguros antes dos imports |
| Network/Supabase | Nenhuma chamada real | Hooks testados com mocks e dados locais |
| QueryClient | Nao necessario nos novos testes | `useCheckinManager` mocka os hooks React Query ja cobertos nas Sprints 11/12 |
| CI/coverage | Sem alteracao | Sprint 14 aumenta coverage real; nao mexe em thresholds |

## Isolamento obrigatorio aplicado

- `vi.clearAllMocks()`
- `localStorage.clear()`
- Reset de `useAppStore`
- Fake timers apenas no arquivo do timer e `vi.useRealTimers()` no teardown
- `navigator.onLine` restaurado depois dos testes offline

>>>>>>> codex/sprint-14-complex-hook-test-expansion
