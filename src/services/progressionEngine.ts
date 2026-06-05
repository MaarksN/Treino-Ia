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
};
