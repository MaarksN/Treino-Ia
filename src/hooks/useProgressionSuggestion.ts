import { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { ProgressionEngine } from '../services/progressionEngine';
import type { ProgressionSuggestion } from '../rules/progressionRules';
import { mapWorkoutHistoryToWorkoutSessions } from '../adapters/workoutHistoryAdapter';

export function useProgressionSuggestion(
  exerciseId: string,
  exerciseName: string,
  muscleGroup?: string,
): ProgressionSuggestion | null {
  const workoutHistory = useAppStore((state) => state.workoutHistory);
  const profile = useAppStore((state) => state.profile);

  return useMemo(() => {
    if (!profile) return null;
    const sessions = mapWorkoutHistoryToWorkoutSessions(workoutHistory);
    return ProgressionEngine.getSuggestionForExercise(
      exerciseId,
      exerciseName,
      sessions,
      muscleGroup,
    );
  }, [exerciseId, exerciseName, muscleGroup, workoutHistory, profile]);
}
