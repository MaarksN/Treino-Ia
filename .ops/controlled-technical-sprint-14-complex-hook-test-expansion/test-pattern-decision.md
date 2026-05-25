# Controlled Technical Sprint 14 - Test Pattern Decision

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
