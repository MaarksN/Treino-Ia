# Evidence - Controlled Technical Sprint 11

## 1. Objetivo

Criar uma fundacao real para testar hooks React Query, iniciando por hooks pequenos e deterministicos, sem Supabase real, rede real, OAuth, Billing ou secrets.

## 2. Base auditada

```txt
Branch inicial: main
Branch de trabalho: codex/react-query-hooks-test-foundation
Sprint 10 merge presente: 03e0744 Controlled Technical Sprint 10 - Coverage Threshold Raise (#99)
Merge posterior presente: c3b53c5 Merge pull request #100 from MaarksN/copilot/fix-ci-job-failure-playwright
git pull: Already up to date
working tree inicial: limpo
```

Nota operacional: `npm` nao estava no `PATH` inicial do PowerShell. Foi usado Node/NPM portatil v22.14.0 em `%TEMP%`, sem alterar o repositorio nem dependencias.

## 3. Hooks React Query candidatos

```txt
useDailyCheckinsQuery
useSaveDailyCheckinMutation
```

Nenhum outro hook direto com `useQuery`, `useMutation`, `useQueryClient` ou `invalidateQueries` foi encontrado alem desses dois.

## 4. Alvos escolhidos

```txt
src/hooks/useDailyCheckinsQuery.ts
src/hooks/useSaveDailyCheckinMutation.ts
```

Motivo: pequenos, deterministicos, service mockavel e com cache/invalidation inspecionavel via QueryClient.

## 5. Padrao QueryClient de teste

Criado:

```txt
src/test/queryClient.tsx
```

Padrao:

```txt
QueryClient novo por teste
retry false para queries e mutations
gcTime Infinity
QueryClientProvider local
queryClient.clear() no afterEach
```

## 6. Testes criados

```txt
src/hooks/useDailyCheckinsQuery.test.tsx
src/hooks/useSaveDailyCheckinMutation.test.tsx
```

Cobertura de comportamento:

```txt
Query: loading inicial, sucesso mockado, cache por query key, erro mockado.
Mutation: service com payload, pending state, sucesso com invalidation, erro preservado sem invalidation.
```

## 7. Resultado dos testes especificos

```txt
npm test -- src/hooks/useDailyCheckinsQuery.test.tsx src/hooks/useSaveDailyCheckinMutation.test.tsx
Test Files: 2 passed
Tests: 5 passed
```

## 8. Resultado de lint/typecheck/test/build/e2e/coverage

```txt
git diff --check: PASS na validacao inicial
npm run lint: PASS
npm run typecheck: PASS
npm test: PASS - 165 files, 633 tests
npm run build: PASS
npm run test:e2e: PASS - 16 tests
npm run test:coverage: PASS - 165 files, 633 tests
```

## 9. Impacto na coverage

```txt
Statements: 27.53%
Branches: 23.51%
Functions: 27.92%
Lines: 27.34%
Thresholds: 27% / 23% / 27% / 27%
Result: PASS
```

## 10. Riscos remanescentes

```txt
useCheckinManager ainda combina React Query, store e side effects.
Fluxo completo de refresh/invalidation em UI consumidora segue para sprint futura.
OAuth/Billing seguem dependentes de ambiente autorizado e secrets.
Coverage ainda deve crescer de forma conservadora.
```

## 11. Proxima acao

```txt
Controlled Technical Sprint 12 - React Query Hooks Coverage Expansion II
```

Alternativa se ambiente autorizado existir:

```txt
OAuth/Billing Sandbox Provisioning
```
