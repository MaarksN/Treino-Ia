# Mapa de Componentes do Dashboard

## `Dashboard.tsx`

**Papel atual:** Root Controller + compositor de pagina.

Responsabilidades validadas:

- Buscar, salvar e migrar dados via `DatabaseService`.
- Manter o root state do fluxo (`profile`, `plan`, `history`, `activeDraft`, autenticacao, mensagens e loading).
- Coordenar callbacks de alto nivel como salvar anamnese, recalcular plano, iniciar treino e finalizar treino.
- Compor a pagina com header, mensagens globais, blocos de resumo, recomendacao, estado vazio e componentes filhos.

Limite arquitetural:

- Componentes filhos nao devem chamar `DatabaseService` diretamente.
- Novas interacoes de produto devem subir eventos via callbacks para o controller quando envolverem persistencia, plano, historico ou autenticacao.
- UI complexa nova deve preferencialmente entrar em componente filho dedicado, preservando o `Dashboard.tsx` como orquestrador.

## Tipos Compartilhados

### `src/pages/Dashboard/types.ts`

- Exporta `ActiveExerciseDraft`.
- Permite que `Dashboard.tsx` e `ActiveWorkout.tsx` compartilhem o contrato do rascunho de treino ativo sem duplicacao.

## Barrel

### `src/pages/Dashboard/components/index.ts`

Exporta:

- `CloudPanel`
- `AnamnesisForm`
- `MetricCard`
- `MetricPanel`
- `HistoryPanel`
- `WeeklyPlan`
- `ActiveWorkout`

## Componentes Filhos

### `CloudPanel.tsx`

**Papel:** bloco de persistencia e autenticacao.

Props principais:

- `persistence`
- `email`
- `password`
- `loading`

Callbacks:

- `onEmailChange`
- `onPasswordChange`
- `onSignIn`
- `onSignUp`
- `onSignOut`

### `AnamnesisForm.tsx`

**Papel:** formulario de criacao/edicao do perfil do atleta.

Props principais:

- `profile`
- `saving`

Callbacks:

- `onChange`
- `onSubmit`

### `MetricPanels.tsx`

**Papel:** componentes visuais puros para metricas.

Exports:

- `MetricCard`
- `MetricPanel`

### `HistoryPanel.tsx`

**Papel:** renderizar ate os cinco treinos mais recentes.

Props principais:

- `history: WorkoutSession[]`

### `WeeklyPlan.tsx`

**Papel:** renderizar dias e exercicios do plano semanal.

Props principais:

- `plan`
- `selectedDayIndex`
- `selectedDay`

Callbacks:

- `onSelectDay`
- `onStartWorkout`

### `ActiveWorkout.tsx`

**Papel:** interface operacional do treino ativo.

Props principais:

- `day`
- `activeDraft`
- `activeFeedback`
- `saving`

Callbacks:

- `onCancel`
- `onUpdateDraft`
- `onUpdateDraftSet`
- `onFeedbackChange`
- `onFinishWorkout`

Estado observado no workspace final:

- Renderiza entrada por serie (`sets`) em vez de campos agregados de carga/reps/RPE.
- Exibe indicador de plato quando `plateauDetected` vem no draft.
- Inclui cronometro de descanso local e popover de calculo RPE.

Regra: este componente nao persiste dados diretamente; finalizacao e ajustes de plano continuam sob responsabilidade do `Dashboard.tsx`.

Nota de escopo: os itens de `sets`, plato, descanso e calculadora RPE parecem pertencer a Phase 8. Eles foram documentados porque existem no workspace final observado, mas nao devem ser confundidos com o hardening original da Phase 7.
