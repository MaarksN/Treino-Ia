# Controlled Technical Sprint 14 - Test Pattern Decision

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

