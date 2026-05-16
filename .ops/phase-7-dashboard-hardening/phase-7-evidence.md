# Phase 7 - Dashboard Hardening - Evidencia Real

## Objetivo

Validar de forma executada, sem "Static/Inferred", se a refatoracao modular do Dashboard esta tecnicamente apta para seguir.

## Estado Git inicial observado

Executado em 2026-05-16, timezone America/Sao_Paulo.

```bash
git status --short
```

Resultado inicial:

```text
 M .ops/phase-6-qa-visual-smoke/phase-6-qa-evidence.md
```

```bash
git branch --show-current
```

Resultado:

```text
main
```

```bash
git log --oneline -5
```

Resultado:

```text
dac5fe3 1
bada150 fase 6
cf75dba Create CloudPanel.tsx
81f3afc Resolve lint hook warnings
5d2c2d9 refactor: extrair logica de sync para useTrainingSync hook
```

Observacao: a alteracao em `.ops/phase-6-qa-visual-smoke/phase-6-qa-evidence.md` ja existia antes desta auditoria e foi preservada como fora do escopo da Phase 7.

## Arquitetura validada

Arquivos do modulo Dashboard observados:

```text
src/pages/Dashboard.tsx
src/pages/Dashboard/types.ts
src/pages/Dashboard/components/index.ts
src/pages/Dashboard/components/CloudPanel.tsx
src/pages/Dashboard/components/AnamnesisForm.tsx
src/pages/Dashboard/components/MetricPanels.tsx
src/pages/Dashboard/components/HistoryPanel.tsx
src/pages/Dashboard/components/WeeklyPlan.tsx
src/pages/Dashboard/components/ActiveWorkout.tsx
```

Contagem real no estado final do workspace:

```text
Dashboard.tsx       558
types.ts             13
ActiveWorkout.tsx   273
AnamnesisForm.tsx   149
CloudPanel.tsx      104
HistoryPanel.tsx     52
MetricPanels.tsx     33
WeeklyPlan.tsx       94
index.ts              6
```

Diagnostico:

- `Dashboard.tsx` atua como root controller e compositor de pagina.
- `CloudPanel`, `AnamnesisForm`, `WeeklyPlan`, `HistoryPanel`, `MetricPanels` e `ActiveWorkout` recebem dados e callbacks por props.
- Os componentes filhos nao chamam `DatabaseService` diretamente.
- `ActiveExerciseDraft` esta centralizado em `src/pages/Dashboard/types.ts`.
- O barrel `src/pages/Dashboard/components/index.ts` exporta os componentes extraidos.
- Nao houve migration Supabase, alteracao de schema SQL ou dependencia nova.

Nota de rigor: o relatorio anterior citava `Dashboard.tsx` com aproximadamente 260 linhas. A medicao real neste workspace e 558 linhas no estado final observado. A arquitetura esta funcionalmente modular, mas o controller ainda contem blocos visuais de pagina como header, hero, resumo, recomendacao e estado vazio.

## Mudancas concorrentes observadas

Durante a auditoria, apos o estado inicial, surgiram alteracoes adicionais em arquivos de produto que nao estavam no primeiro `git status --short`:

```text
src/pages/Dashboard.tsx
src/pages/Dashboard/components/ActiveWorkout.tsx
src/pages/Dashboard/types.ts
src/rules/iaEngine.ts
src/services/database.ts
.ops/phase-8-active-workout-v1/phase-8-evidence.md
```

Essas alteracoes introduzem formato de `sets`, campos legados opcionais em `WorkoutExerciseLog`, deteccao de plato, cronometro de descanso e calculadora RPE. Isso se parece com trabalho de Phase 8 e nao deve ser tratado como simples hardening de Phase 7.

Como elas passaram a afetar o typecheck do workspace, foram consideradas na validacao final. O ajuste feito nesta auditoria foi limitado a compatibilidade de tipo e limpeza mecanica:

- Remocao de imports e helpers nao usados deixados pela extracao do Dashboard.
- Conversao de imports usados apenas como tipo para `type`.
- Ajuste em `buildAdaptiveRecommendation` para calcular RPE usando `exercise.rpe` legado quando existir ou a media de `exercise.sets` quando o novo formato estiver presente.
- Remocao de trailing whitespace em `ActiveWorkout.tsx`.

## Falhas reais encontradas

Uma rodada intermediaria de `npm run typecheck` falhou depois das mudancas concorrentes:

```text
src/rules/iaEngine.ts(253,53): error TS18048: 'exercise.rpe' is possibly 'undefined'.
```

Falha corrigida com fallback compatível para RPE por sets.

## Validacoes reais finais executadas

### Lint

```bash
npm run lint
```

Resultado final:

```text
PASS
eslint "src/**/*.{ts,tsx}" "tests/**/*.ts" "api/**/*.ts" "*.{js,ts}"
Sem erros reportados.
```

### Typecheck

```bash
npm run typecheck
```

Resultado final:

```text
PASS
node --max-old-space-size=4096 ./node_modules/typescript/bin/tsc --noEmit
Sem erros reportados.
```

### Testes

```bash
npm test
```

Resultado final:

```text
PASS
Test Files  39 passed (39)
Tests       139 passed (139)
Duration    14.53s
```

### Build

```bash
npm run build
```

Resultado final:

```text
PASS
vite v6.4.2 building for production...
1891 modules transformed.
built in 5.43s
```

Avisos nao bloqueantes do build:

```text
Generated an empty chunk: "motion".
src/services/supabaseClient.ts is dynamically imported by src/utils/errorTelemetry.ts
but also statically imported by varios services; dynamic import will not move module into another chunk.
```

### Diff hygiene

```bash
git diff --check
```

Resultado final:

```text
PASS
Sem trailing whitespace ou erros de whitespace.
```

## Veredito

A validacao tecnica real do workspace passou: lint, typecheck, testes, build e diff check.

Commit/push nao devem ser feitos automaticamente enquanto o diff misturar hardening de Phase 7 com alteracoes concorrentes de aparencia Phase 8. Separar esse escopo antes de publicar evita mascarar feature nova como validacao.
