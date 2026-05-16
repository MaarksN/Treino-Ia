# Mapa de Componentes do Dashboard

## `Dashboard.tsx`
**Papel:** *Smart Component / Root Controller*.
Responsável exclusivo por:
- Buscar e persistir dados chamando a classe `DatabaseService`.
- Manter o Root State do fluxo (*profile, plan, history, activeDraft*).
- Repassar dados cruciais como propriedades (props) para os componentes filhos.
**Onde NÃO colocar lógica:** Elementos de UI, renderização de ícones SVG, estilização Tailwind (excessão para o esqueleto base de grid/flex).

---

## Filhos (Dumb Components)
Localizados em `src/pages/Dashboard/components/`

### 1. `CloudPanel.tsx`
- **Papel:** Tela/bloco de configuração de autenticação do usuário.
- **Props Recebidas:** `email`, `password`, `loading`, `persistence`.
- **Callbacks:** `onSignIn`, `onSignUp`, `onSignOut`, e mutadores de texto.

### 2. `AnamnesisForm.tsx`
- **Papel:** Formulário interativo para definir as diretrizes do atleta (lesões, tempo de treino, dias).
- **Props Recebidas:** Objeto `profile`, booleano `saving`.
- **Callbacks:** `onChange`, `onSubmit`.

### 3. `MetricPanels.tsx`
- **Papel:** Exibição puramente cosmética das estatísticas vitais do treino (Volume, Foco, Frequência).
- **Exporta:** `MetricCard` e `MetricPanel`.

### 4. `HistoryPanel.tsx`
- **Papel:** Renderizar cronologicamente os últimos 5 treinos salvos na memória, avaliando progresso bruto.
- **Props Recebidas:** Lista de `WorkoutSession[]`.

### 5. `WeeklyPlan.tsx`
- **Papel:** Transformar o objeto mental da Inteligência Artificial em botões de "Iniciar Treino" para o atleta. Renderiza a estrutura diária proposta.
- **Props Recebidas:** `plan`, `selectedDayIndex`.
- **Callbacks:** `onSelectDay`, `onStartWorkout`.

### 6. `ActiveWorkout.tsx`
- **Papel:** A sala de controle operacional do treino físico. Interação em tempo-real (caixas de texto, checkboxes) enquanto o atleta treina.
- **Props Recebidas:** `day` (informação estática), `activeDraft` (estado atual das marcações), `activeFeedback` (texto livre).
- **Callbacks:** `onUpdateDraft`, `onFinishWorkout`, `onFeedbackChange`.
- **Proibido:** NUNCA chamar APIs de banco de dados diretamente daqui. Qualquer salvamento deve ser evocado pelos callbacks, forçando o `Dashboard.tsx` a assumir a responsabilidade.
