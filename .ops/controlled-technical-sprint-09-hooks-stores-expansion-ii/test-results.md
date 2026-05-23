| Alvo | Teste | Resultado | Evidência | Observação |
|---|---|---|---|---|
| `useAppNavigation` | initializes the view store with the requested initial view | PASS | `npm test -- src/hooks/...` | Verifica estado inicial e flag `initialized`. |
| `useAppNavigation` | does not overwrite an already initialized view | PASS | `npm test -- src/hooks/...` | Garante respeito à proteção do `viewStore.initializeView`. |
| `useAppNavigation` | navigates through explicit view actions | PASS | `npm test -- src/hooks/...` | Exercita ações reais de navegação. |
| `useAuthState` | refreshes the session on sign in and token refresh events | PASS | `npm test -- src/hooks/...` | Mock de auth dispara eventos relevantes. |
| `useAuthState` | ignores auth events that do not require a session refresh | PASS | `npm test -- src/hooks/...` | Evita refresh em `SIGNED_OUT`/`USER_UPDATED`. |
| `useAuthState` | unsubscribes from auth changes on unmount | PASS | `npm test -- src/hooks/...` | Verifica cleanup real do effect. |
| `useTrainingSync` | hydrates profile, plans, current plan and history from a mocked Supabase result | PASS | `npm test -- src/hooks/...` | Atualiza `useAppStore` sem Supabase real. |
| `useTrainingSync` | leaves the app store unchanged when backend data is not Supabase backed | PASS | `npm test -- src/hooks/...` | Garante no-op seguro em `mock_dev_only`. |
| `useTrainingSync` | rehydrates after a successful mocked legacy migration | PASS | `npm test -- src/hooks/...` | Exercita caminho de migração mockada + hydrate. |
| `useTrainingSync` | captures hydration errors without throwing to the caller | PASS | `npm test -- src/hooks/...` | Verifica fallback/telemetry mockado. |
| Harness existente | redaction oversized fixture | PASS | `npx vitest run ...` | Fixture reduzido mantendo redaction/truncation. |
| Harness existente | Gemini 4xx response mock | PASS | `npx vitest run ...` | `Response` nova por chamada evita body reutilizado. |
