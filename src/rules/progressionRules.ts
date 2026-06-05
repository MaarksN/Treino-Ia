import type { WorkoutSession, WorkoutExerciseLog, ExerciseSet } from '../services/database';

export type ProgressionAction =
  | 'increase'
  | 'maintain'
  | 'decrease'
  | 'deload'
  | 'insufficient_data';
export type ProgressionConfidence = 'low' | 'medium' | 'high';

export type ProgressionSuggestion = {
  exerciseId: string;
  exerciseName?: string;
  previousLoad?: number;
  suggestedLoad?: number;
  delta?: number;
  action: ProgressionAction;
  confidence: ProgressionConfidence;
  reason: string;
};

// Configurações de incremento por grupo muscular (estimativa)
const INCREMENT_RULES: Record<string, number> = {
  Peito: 2.5,
  Costas: 2.5,
  Quadríceps: 5,
  Posteriores: 5,
  Glúteos: 5,
  Ombros: 1,
  Bíceps: 1,
  Tríceps: 1,
  Panturrilhas: 2.5,
  Core: 0, // Normalmente peso corporal
};

const DEFAULT_INCREMENT = 2; // Default de 2kg se não achar o grupo

export function calculateProgression(
  exerciseId: string,
  exerciseName: string,
  history: WorkoutSession[],
  muscleGroup?: string,
): ProgressionSuggestion {
  if (!history || history.length === 0) {
    return {
      exerciseId,
      exerciseName,
      action: 'insufficient_data',
      confidence: 'low',
      reason: 'Não há histórico suficiente para este exercício.',
    };
  }

  // Filtrar apenas logs deste exercício no histórico
  const exerciseLogs: WorkoutExerciseLog[] = [];
  history.forEach((session) => {
    const log = session.exercises?.find(
      (l) => l.exerciseId === exerciseId || l.name === exerciseName,
    );
    if (log) {
      exerciseLogs.push(log);
    }
  });

  if (exerciseLogs.length === 0) {
    return {
      exerciseId,
      exerciseName,
      action: 'insufficient_data',
      confidence: 'low',
      reason: 'Exercício nunca registrado.',
    };
  }

  // Ordenar logs por data mais recente primeiro (assumindo completedAt na session, não temos date no WorkoutExerciseLog isolado, então assumimos que a ordem de history já é decrescente ou precisamos mapear com a data da session)
  // Mas como não temos session date diretamente no log, vamos assumir que history já está do mais recente para o mais antigo,
  // ou passamos a data da sessão junto. Como não temos isso aqui e estamos apenas pegando o primeiro que apareceu no histórico
  // (assumindo que `history` é passado mais recente primeiro):
  const lastLog = exerciseLogs[0];
  const previousLoad = lastLog.actualWeight || 0;

  if (previousLoad <= 0) {
    return {
      exerciseId,
      exerciseName,
      previousLoad: 0,
      suggestedLoad: 0,
      action: 'maintain',
      confidence: 'low',
      reason: 'Carga anterior zero ou não registrada, focar na execução.',
    };
  }

  // Analisar performance da última sessão
  const sets = lastLog.sets || [];
  if (sets.length === 0) {
    return {
      exerciseId,
      exerciseName,
      previousLoad,
      suggestedLoad: previousLoad,
      action: 'maintain',
      confidence: 'low',
      reason: 'Séries não detalhadas, manter a carga.',
    };
  }

  // Falhou se rpe for 10 (estimativa já que não temos o campo failed no ExerciseSet de database.types.ts)
  const failedSets = sets.filter((s) => s.rpe >= 10).length;
  const avgRpe =
    sets.reduce((acc, curr) => acc + (curr.rpe || 0), 0) / sets.length || lastLog.rpe || 0;

  const increment = muscleGroup
    ? (INCREMENT_RULES[muscleGroup] ?? DEFAULT_INCREMENT)
    : DEFAULT_INCREMENT;

  if (failedSets > 0) {
    // Falhou, sugerir redução ou manutenção (deload se falhas repetidas)
    return {
      exerciseId,
      exerciseName,
      previousLoad,
      suggestedLoad: Math.max(0, previousLoad - increment),
      delta: -increment,
      action: 'decrease',
      confidence: 'medium',
      reason: 'Falha detectada no último treino, reduzir carga para recuperar técnica.',
    };
  }

  if (avgRpe >= 9) {
    return {
      exerciseId,
      exerciseName,
      previousLoad,
      suggestedLoad: previousLoad,
      action: 'maintain',
      confidence: 'medium',
      reason: 'Esforço muito alto (RPE >= 9). Manter a carga e focar na recuperação.',
    };
  }

  // Condição para aumentar a carga:
  // Completou tudo, RPE aceitável (<9)
  if (avgRpe > 0 && avgRpe <= 8) {
    return {
      exerciseId,
      exerciseName,
      previousLoad,
      suggestedLoad: previousLoad + increment,
      delta: increment,
      action: 'increase',
      confidence: 'high',
      reason: 'Boa execução com esforço controlado. Aumentar carga.',
    };
  }

  // Se não tem RPE mas não falhou
  return {
    exerciseId,
    exerciseName,
    previousLoad,
    suggestedLoad: previousLoad + increment,
    delta: increment,
    action: 'increase',
    confidence: 'medium',
    reason: 'Séries completadas sem falha, mas sem registro de esforço. Tentar aumentar.',
  };
}
