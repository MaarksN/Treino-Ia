# P1 Transactional Consistency - Evidence

## 1. Objetivo
Reduzir race conditions em gamificação, criar contratos para operações idempotentes, tornar o fallback local explícito e evitar a quebra do current plan.

## 2. Problemas encontrados
- Fallback local para `saveCurrentPlan` era silencioso.
- Endpoints de gamificação tinham verificações determinísticas, mas não tinham uma camada de chaves de idempotência isolada e explícita.

## 3. Correções aplicadas
- Criado `api/_lib/idempotency.ts` com funções `buildIdempotencyKey` e `getDailyPeriod`.
- Criado helper `CurrentPlanConsistencyHelper` para `saveCurrentPlan` no frontend que mapeia status persistente (Supabase vs local vs erro).
- Dashboard refatorado para exibir avisos quando a alteração ocorre no fallback local.
- Endpoint de gamificação atualizado para incluir comentários sobre necessidade de RPC, usar a camada de idempotência no client e rejeitar requisições de períodos duplicados.

## 4. Arquivos alterados
- `api/_lib/idempotency.ts` e test
- `src/services/data/currentPlanConsistency.ts` e test
- `api/gamification/event.ts`
- `src/pages/Dashboard.tsx`

## 5. Testes criados
- Testes unitários para idempotency.
- Testes unitários para currentPlanConsistency.

## 6. Resultado dos comandos
`git diff --check`, `lint`, `typecheck`, `test`, e `build` com sucesso.

## 7. Limitações restantes
Para garantir race-condition free num nível absoluto em multi-instâncias, a checagem no endpoint Node (`gamification/event.ts`) não é suficiente sem Row Locks; requer que a checagem e inserção sejam encapsuladas via um RPC PL/pgSQL transacional no Supabase.

## 8. Próxima fase recomendada
P1 AI Governance Gateway.
