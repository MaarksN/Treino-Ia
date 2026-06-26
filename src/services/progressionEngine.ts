import type { WorkoutSession, UserProfile } from './database';
import { calculateProgression, ProgressionSuggestion } from '../rules/progressionRules';

export const ProgressionEngine = {
  getSuggestionsForSession(
    profile: UserProfile,
    history: WorkoutSession[],
    targetExercises: { id: string; name: string; muscleGroup?: string }[],
  ): ProgressionSuggestion[] {
    // Retorna recomendações para uma lista de exercícios alvo baseada no histórico.
    return targetExercises.map((exercise) =>
      calculateProgression(exercise.id, exercise.name, history, exercise.muscleGroup),
    );
  },

  getSuggestionForExercise(
    exerciseId: string,
    exerciseName: string,
    history: WorkoutSession[],
    muscleGroup?: string,
  ): ProgressionSuggestion {
    return calculateProgression(exerciseId, exerciseName, history, muscleGroup);
  },

  getSafetyInsight(painRecords: any[], history: WorkoutSession[]) {
    const recentPain = painRecords.filter(r => !r.resolved).slice(0, 3);
    const avgRpe = history.slice(0, 5).reduce((acc, s) => acc + (s.averageRpe || 0), 0) / 5;

    if (recentPain.some(p => p.severity === 'moderada' || p.severity === 'alta')) {
      return {
        status: 'caution',
        message: 'Dor persistente detectada. Sugerimos uma semana de Deload ou foco em mobilidade.',
      };
    }

    if (avgRpe > 8.5) {
      return {
        status: 'warning',
        message: 'RPE médio muito alto nos últimos treinos. Risco de overtraining aumentado.',
      };
    }

    return { status: 'safe', message: 'Métricas de segurança dentro da normalidade.' };
  }
};
