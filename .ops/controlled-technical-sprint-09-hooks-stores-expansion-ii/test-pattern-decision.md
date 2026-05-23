# Test Pattern Decision

## Padrão escolhido

| Padrão | Aplicação | Motivo |
|---|---|---|
| `renderHook` | `useAppNavigation`, `useAuthState`, `useTrainingSync` | Permite exercitar hooks reais sem componentes artificiais. |
| Zustand store real com reset | `useAppNavigation`, `useTrainingSync` | Mantém a integração real com `viewStore`/`useAppStore` e evita vazamento entre testes. |
| `vi.mock` para serviços | `useAuthState`, `useTrainingSync` | Remove Supabase real, rede real e secrets do teste. |
| `act` para updates | Navegação e chamadas async | Mantém React state updates sincronizados nos asserts. |
| Timeout de teste ampliado | Vitest global `testTimeout: 15000` | Evita falsos negativos sob coverage instrumentado sem remover thresholds ou asserts. |

## Reset e isolamento

- `useViewStore.setState(initialViewStoreState, true)` antes dos testes de navegação.
- `useAppStore.setState(initialAppStoreState, true)` antes dos testes de sync.
- `localStorage.clear()` nos testes que tocam store/sync.
- `vi.clearAllMocks()` em todos os testes com mocks.

## Decisões de segurança

- Nenhum teste usa Supabase real.
- Nenhum teste usa OAuth/Billing real.
- Nenhum teste usa secret.
- Nenhum teste valida apenas import/instanciação.
- Nenhum coverage threshold foi removido ou reduzido.
