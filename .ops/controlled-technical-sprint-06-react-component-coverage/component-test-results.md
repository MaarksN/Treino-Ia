| Componente | Teste | Resultado | Evidência | Observação |
|---|---|---|---|---|
| ReadinessCard | renders placeholder when checkin is null | ✅ PASS | `npx vitest run ...` | 2 ms, text/role assertions |
| ReadinessCard | renders readiness metrics when checkin is provided | ✅ PASS | `npx vitest run ...` | Mockou utils/personalization |
| AppUpdateBanner | renders nothing initially when there is no update | ✅ PASS | `npx vitest run ...` | Mockou utils/pwaUtils |
| AppUpdateBanner | renders the banner when an update is available | ✅ PASS | `npx vitest run ...` | UI state manipulation |
| AppUpdateBanner | calls reloadForUpdate when update button is clicked | ✅ PASS | `npx vitest run ...` | Callback coverage, fireEvent |
| AppUpdateBanner | hides the banner when the close button is clicked | ✅ PASS | `npx vitest run ...` | DOM mutation verification |
| ConnectivityBanner | renders online state with 0 pending items | ✅ PASS | `npx vitest run ...` | navigator.onLine mock, utils/offlineQueue mock |
| ConnectivityBanner | renders offline state when navigator is offline | ✅ PASS | `npx vitest run ...` | window offline event check |
| ConnectivityBanner | updates state when offline event is fired | ✅ PASS | `npx vitest run ...` | dynamic event dispatch |
| ConnectivityBanner | updates state and syncs when online event is fired | ✅ PASS | `npx vitest run ...` | mock utils/syncUtils |
