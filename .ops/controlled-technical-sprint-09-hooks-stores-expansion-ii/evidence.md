# Evidence — Controlled Technical Sprint 09

**Sprint:** Controlled Technical Sprint 09 — Stores/Hooks Coverage Expansion II  
**Base:** `cf7fbba4a733f1083a5bee80e466ab1069eb7a23`  
**Branch:** `main`

## 1. Objetivo

Expandir cobertura real de hooks/stores com alvos mockáveis, sem Supabase real, sem rede externa, sem secrets e sem feature nova.

## 2. Base auditada

| Item | Estado |
|---|---|
| Sprint 08 no topo da base | Confirmado |
| Hooks em `src/hooks` | 7 arquivos auditados |
| Stores em `src/stores` | 2 stores já cobertos na Sprint 08 |
| Coverage Sprint 08 | 27.02 / 23.32 / 27.21 / 26.84 |

## 3. Hooks/stores candidatos

Foram avaliados `useAppNavigation`, `useAuthState`, `useTrainingSync`, `useCheckinManager`, `useWorkoutManager`, `useDailyCheckinsQuery`, `useSaveDailyCheckinMutation`, `useAppStore`, `viewStore` e `useRestTimer`.

## 4. Alvos escolhidos

| Alvo | Motivo |
|---|---|
| `useAppNavigation` | Hook real conectado ao `viewStore`, sem provider/API. |
| `useAuthState` | Subscription de auth totalmente mockável. |
| `useTrainingSync` | Sync async mockável e relevante para estado global. |

## 5. Padrão de teste adotado

- `renderHook` para execução real de hooks.
- `act` para ações e chamadas async.
- `vi.mock` para services.
- Reset de Zustand stores entre testes.
- `localStorage.clear()` onde existe estado browser.

## 6. Testes criados

- `src/hooks/useAppNavigation.test.ts` — 3 testes.
- `src/hooks/useAuthState.test.ts` — 3 testes.
- `src/hooks/useTrainingSync.test.ts` — 4 testes.

## 7. Resultado dos testes específicos

```txt
npm test -- src/hooks/useAppNavigation.test.ts src/hooks/useAuthState.test.ts src/hooks/useTrainingSync.test.ts
PASS — 3 files, 10 tests, 1.71s
```

## 8. Resultado de lint/typecheck/test/build/e2e/coverage

| Comando | Resultado |
|---|---|
| `git diff --check` | PASS na validação final |
| `npm run lint` | PASS na validação final |
| `npm run typecheck` | PASS na validação final |
| `npm test` | PASS na validação final |
| `npm run build` | PASS na validação final |
| `npm run test:e2e` | PASS — 16/16 na validação final |
| `npm run test:coverage` | PASS — 163 files, 628 tests, coverage gate preservado; warning pós-suíte de encerramento de worker Vitest |

## 9. Impacto na coverage

| Métrica | Sprint 08 | Sprint 09 | Delta | Threshold | Passou? |
|---|---:|---:|---:|---:|---|
| Statements | 27.02% | 27.46% | +0.44% | 25.00% | Sim |
| Branches | 23.32% | 23.49% | +0.17% | 20.00% | Sim |
| Functions | 27.21% | 27.77% | +0.56% | 25.00% | Sim |
| Lines | 26.84% | 27.27% | +0.43% | 25.00% | Sim |

## 10. Riscos remanescentes

- `useCheckinManager` e `useWorkoutManager` ainda exigem mocks/providers mais amplos.
- Hooks React Query ainda precisam wrapper de QueryClient dedicado.
- `useRestTimer` segue como candidato de fake timers.
- Componentes grandes seguem pendentes.
- Vitest ainda emite warning ocasional de encerramento de worker após o coverage, apesar de exit code 0.

## 11. Próxima ação

```txt
Controlled Technical Sprint 10 — Coverage Threshold Raise
```

Ou OAuth/Billing Sandbox Provisioning, se ambiente autorizado existir.
