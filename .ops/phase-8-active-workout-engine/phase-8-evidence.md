# Phase 8 Evidence — Active Workout Engine v1

## 1) Objetivo da fase
Implementar engine v1 do treino ativo com tonelagem, resumo em tempo real, timer de descanso persistente, helper RPE, autofill por histórico e detecção simples de possível platô.

## 2) Itens estratégicos atacados
- 21: Cronômetro de descanso persistente v1.
- 22: Autofill v1 por histórico local existente.
- 23: Sinal discreto de possível platô.
- 24: Tonelagem real por peso x reps.
- 29: Helper RPE embutido.

## 3) Arquivos criados
- `src/pages/Dashboard/services/activeWorkoutEngine.ts`
- `src/pages/Dashboard/services/activeWorkoutEngine.test.ts`
- `src/pages/Dashboard/hooks/useRestTimer.ts`
- `.ops/phase-8-active-workout-engine/phase-8-evidence.md`

## 4) Arquivos alterados
- `src/pages/Dashboard/components/ActiveWorkout.tsx`
- `src/pages/Dashboard/types.ts`
- `src/pages/Dashboard.tsx`

## 5) Estrutura do engine
Service puro com funções de cálculo e decisão (sem React, sem side effects, sem Supabase).

## 6) Tonelagem
Tonelagem por série: `peso * reps` com sanitização de inválidos para zero.
Tonelagem do exercício: soma das séries.
Tonelagem do treino: soma dos exercícios.

## 7) Timer
Hook `useRestTimer` com persistência em `localStorage` por timestamp final (`endAt`) e atualização por diferença de tempo real.

## 8) RPE helper
Mapeamento simples RPE 6–10 para guidance textual não prescritivo.

## 9) Autofill
Sugestão discreta no primeiro set por exercício com dados do último treino equivalente; usuário pode aplicar ou ignorar; não sobrescreve input digitado.

## 10) Platô v1
Se existem 3 logs recentes do mesmo exercício e não há aumento de volume no recorte, sinaliza “possível platô”.

## 11) Testes
Adicionados testes unitários do service cobrindo tonelagem, progresso, RPE, platô, autofill e resumo.

## 12) Comandos executados
- `git status --short`
- `git branch --show-current`
- `git log --oneline -5`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

## 13) Resultados reais
Validações executadas com sucesso nesta fase (detalhe final no relatório de entrega).

## 14) Warnings conhecidos mantidos
- Warning de chunk dinâmico/estático de `supabaseClient` mantido.
- Warning `Generated an empty chunk: "motion"` mantido.

## 15) Pendências para Phase 9
- Evoluir timer com presets por exercício e aviso sonoro opcional.
- Expandir autofill para múltiplas séries com fallback por faixa de reps.
- Melhorar platô com tendência temporal e tolerância percentual.
