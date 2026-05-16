# Phase 8 — Active Workout Engine v1

## 1. Objetivo da Fase
Evoluir o "Modo Treino Ativo" para um Engine v1 inteligente, abandonando inputs rasos de texto e implementando um controle de sessão estruturado, focado em hipertrofia real (tonelagem, histórico e RPE).

## 2. Alterações de Schema (Database)
Sem realizar migrações quebradiças (já que o backend armazena o treino finalizado em JSON no Supabase), reestruturamos o tipo base no Typescript:
- O `WorkoutExerciseLog` migrou de propriedades primitivas (`actualWeight`, `actualReps`) para um Array tipado `sets?: ExerciseSet[]`.
- Propriedades legadas foram mantidas opcionais para não quebrar treinos antigos parseados do local storage.

## 3. Funcionalidades de Inteligência Adicionadas

### A. Autopreenchimento Baseado no Histórico
O `Dashboard.tsx` (`createActiveDraft`) agora inspeciona a array `history`.
Ao montar o Treino do Dia, ele puxa as exatas cargas, repetições e percepções de esforço que o atleta realizou no *último treino* daquele exercício específico.

### B. Detecção Antecipada de Platô
No mesmo hook de parsing do histórico, avaliamos os últimos 3 treinos.
- Regra de negócio: Se o peso inicial for idêntico nos últimos 3 encontros E o RPE reportado for extremo (>= 8), a flag `plateauDetected` dispara.
- UX Resultante: O painel do exercício exibe um badge amarelo de `Platô Detectado` para sugerir ao usuário trocar o equipamento ou buscar a regressão de RIR.

### C. Calculadora Embutida de RPE/RIR
- UI adicionada na célula de RPE no novo DataGrid do exercício.
- Traz os labels corretos (ex: RIR 0 = Falha total = RPE 10) num balão *Glassmorphism*. O atleta seleciona o RIR e o input numérico do RPE se auto-preenche.

### D. Cálculo de Tonelagem Real
- Antes: `max weight * max reps * total sets` (superestimado).
- Agora: Redução cirúrgica iterando por `set.weight * set.reps` em todos os sets marcados como concluídos da tabela. O payload enviado ao backend/`history` é matematicamente acurado.

### E. Cronômetro Flutuante e Persistente
- Sempre que um Set é marcado como concluído, a interface de `ActiveWorkout` resgata o descanso sugerido pelo motor de IA (ex: "90s") e inicia um `setInterval`.
- Um badge neon flutuante (`fixed bottom-6`) é acionado no modo *bounce-subtle*. Ele não bloqueia a UI e avisa com cor magenta quando é hora de iniciar a próxima série.

## 4. Validação e Qualidade
Todo fluxo refatorado passou por simulação estática de tipos TS e conferência de contratos. A prop drilling via Controller (`Dashboard` -> `ActiveWorkout`) para os checkboxes da tabela obedece às regras restritas de imutabilidade do React via callbacks encadeados (`onUpdateDraftSet`).
