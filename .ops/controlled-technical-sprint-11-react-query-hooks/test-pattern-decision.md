# Test Pattern Decision - Controlled Technical Sprint 11

## Helper

Criado:

```txt
src/test/queryClient.tsx
```

Padrao adotado:

```txt
createTestQueryClient()
createQueryClientWrapper(queryClient)
```

Configuracao:

```txt
queries.retry = false
queries.gcTime = Infinity
mutations.retry = false
```

## Rules

```txt
QueryClient novo por teste.
QueryClientProvider local via wrapper de teste.
queryClient.clear() no afterEach.
vi.clearAllMocks() no beforeEach/afterEach.
localStorage.clear() no afterEach.
Services mockados com vi.mock.
Sem Supabase real.
Sem rede real.
Sem secrets.
Sem dependencia nova.
```

## Rationale

Retries desligados evitam flake em cenarios de erro.
Um QueryClient novo por teste evita vazamento de cache entre suites.
O helper fica em `src/test` para reuso nas proximas sprints sem alterar runtime de produto.
