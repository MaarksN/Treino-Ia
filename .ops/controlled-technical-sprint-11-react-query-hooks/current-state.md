# Current State - Controlled Technical Sprint 11

## Base Git

| Area | Arquivo | Estado atual | Risco | Acao nesta sprint |
|---|---|---|---|---|
| Git base | `main` | `git pull` retornou `Already up to date`; historico contem `03e0744 Controlled Technical Sprint 10 - Coverage Threshold Raise (#99)` e `c3b53c5 Merge pull request #100`. | Baixo; Sprint 10 esta presente, com um merge posterior de CI Playwright. | Criada branch `codex/react-query-hooks-test-foundation` para a implementacao. |
| Runtime local | PowerShell | `npm` nao estava no `PATH` inicial; Node/NPM portatil v22.14.0 foi usado em `%TEMP%` com `PATH` temporario. | Baixo; nao altera dependencias do repositorio. | Registrar evidencia operacional e executar comandos reais via `npm`. |
| Coverage gate | `vitest.config.ts` | Thresholds preservados: statements 27, branches 23, functions 27, lines 27. | Medio se cobertura cair abaixo do gate. | Nao alterar config; validar `npm run test:coverage`. |

## Audit Table

| Area | Arquivo | Estado atual | Risco | Acao nesta sprint |
|---|---|---|---|---|
| React Query hook | `src/hooks/useDailyCheckinsQuery.ts` | Usa `useQuery`, exporta `dailyCheckinsQueryKey`, chama `loadDailyCheckins`. Sem teste dedicado antes desta sprint. | Cache/loading/erro sem cobertura; risco de chamada real se nao mockado. | Escolhido para teste com QueryClient isolado e service mockado. |
| React Query hook | `src/hooks/useSaveDailyCheckinMutation.ts` | Usa `useMutation`, `useQueryClient` e invalida `dailyCheckinsQueryKey` em sucesso. Sem teste dedicado antes desta sprint. | Invalidation e erro de mutation sem cobertura; risco de cache compartilhado. | Escolhido para teste com QueryClient isolado, service mockado e spy em invalidation. |
| Hook consumidor | `src/hooks/useCheckinManager.ts` | Consome os dois hooks React Query, store Zustand, gamification e callbacks de app. | Alto para esta sprint por combinar QueryClient, store e side effects. | Nao escolhido; fica como expansao futura. |
| Hooks ja cobertos | `src/hooks/useAppNavigation.test.ts`, `src/hooks/useAuthState.test.ts`, `src/hooks/useTrainingSync.test.ts` | Cobertura existente de hooks/stores das Sprints 08/09. | Baixo; fora do foco React Query. | Preservar. |
| Services | `src/services/healthService.ts` | `loadDailyCheckins` e `saveDailyCheckin` podem cair em Supabase real ou mock local dependendo de auth/config. | Alto se teste chamar service real. | Usar `vi.mock('../services/healthService')`; nenhuma rede/Supabase real. |
| Test harness | `src/test/setup.ts` | Setup global com `@testing-library/jest-dom/vitest`; nao havia helper de QueryClient. | Medio para testes React Query repetirem boilerplate ou vazarem cache. | Criar `src/test/queryClient.tsx`. |
| Reports anteriores | `.ops/controlled-technical-sprint-09-hooks-stores-expansion-ii/final-report.md` | Indica hooks React Query como risco remanescente. | Medio. | Atacar a fundacao dedicada nesta sprint. |
| Reports anteriores | `.ops/controlled-technical-sprint-10-coverage-threshold-raise/final-report.md` | Registra thresholds 27/23/27/27 e PASS. | Medio se gate for reduzido. | Preservar thresholds. |

## Hook Inventory

```txt
src/hooks/useAppNavigation.test.ts
src/hooks/useAppNavigation.ts
src/hooks/useAuthState.test.ts
src/hooks/useAuthState.ts
src/hooks/useCheckinManager.ts
src/hooks/useDailyCheckinsQuery.ts
src/hooks/useSaveDailyCheckinMutation.ts
src/hooks/useTrainingSync.test.ts
src/hooks/useTrainingSync.ts
src/hooks/useWorkoutManager.ts
```

## Existing Hook Tests Before Sprint 11

```txt
src/hooks/useAppNavigation.test.ts
src/hooks/useAuthState.test.ts
src/hooks/useTrainingSync.test.ts
```

## React Query Search Result

```txt
package.json: @tanstack/react-query
src/hooks/useDailyCheckinsQuery.ts: useQuery
src/hooks/useSaveDailyCheckinMutation.ts: useMutation, useQueryClient, invalidateQueries
```
