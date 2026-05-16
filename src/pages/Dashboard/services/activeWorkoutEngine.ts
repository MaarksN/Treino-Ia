import { type WorkoutExerciseLog, type WorkoutSession } from '../../../services/database';
import { type ActiveExerciseDraft } from '../types';

export interface WorkoutProgressSummary {
  completedExercises: number;
  totalExercises: number;
  percent: number;
}

export interface WorkoutTonnageSummary {
  totalTonnage: number;
  completedTonnage: number;
}

export interface RpeGuidance {
  label: string;
  guidance: string;
}

export interface PlateauSignal {
  exerciseId: string;
  isPlateau: boolean;
  reason?: string;
}

export interface ExerciseAutofillSuggestion {
  exerciseId: string;
  hasSuggestion: boolean;
  weight?: string;
  reps?: string;
  rpe?: string;
}

export interface ActiveWorkoutSummary {
  progress: WorkoutProgressSummary;
  tonnage: WorkoutTonnageSummary;
  averageRpe: number;
  accumulatedRpeLoad: number;
}

function parseValue(value: string | number | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : 0;
  if (typeof value !== 'string') return 0;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function calculateExerciseVolume(sets: Array<{ weight: string | number; reps: string | number }>): number {
  return sets.reduce((sum, set) => sum + (parseValue(set.weight) * parseValue(set.reps)), 0);
}

export function calculateWorkoutTonnage(draft: ActiveExerciseDraft[]): WorkoutTonnageSummary {
  const totalTonnage = draft.reduce((sum, exercise) => sum + calculateExerciseVolume(exercise.sets), 0);
  const completedTonnage = draft.reduce((sum, exercise) => (
    exercise.completed ? sum + calculateExerciseVolume(exercise.sets) : sum
  ), 0);

  return { totalTonnage, completedTonnage };
}

export function calculateWorkoutProgress(draft: ActiveExerciseDraft[]): WorkoutProgressSummary {
  const totalExercises = draft.length;
  const completedExercises = draft.filter(item => item.completed).length;
  const percent = totalExercises ? Math.round((completedExercises / totalExercises) * 100) : 0;
  return { completedExercises, totalExercises, percent };
}

export function getRpeGuidance(rpeInput: string | number | null | undefined): RpeGuidance {
  const rpe = parseValue(rpeInput);
  if (rpe >= 10) return { label: 'RPE 10', guidance: 'Falha ou esforço máximo.' };
  if (rpe >= 9) return { label: 'RPE 9', guidance: 'Muito difícil, cerca de 1 repetição em reserva.' };
  if (rpe >= 8) return { label: 'RPE 8', guidance: 'Difícil, cerca de 2 repetições em reserva.' };
  if (rpe >= 7) return { label: 'RPE 7', guidance: 'Moderado, cerca de 3 repetições em reserva.' };
  if (rpe >= 6) return { label: 'RPE 6', guidance: 'Leve a moderado, várias repetições em reserva.' };
  return { label: 'RPE não informado', guidance: 'Use RPE 6-10 para registrar esforço da série.' };
}

export function detectSimplePlateau(exerciseId: string, history: WorkoutSession[]): PlateauSignal {
  const logs = history
    .flatMap(session => session.exercises)
    .filter(ex => ex.exerciseId === exerciseId)
    .slice(0, 3);

  if (logs.length < 3) {
    return { exerciseId, isPlateau: false };
  }

  const [latest, ...older] = logs;
  const latestVolume = calculateExerciseVolume((latest.sets ?? []).map(set => ({ weight: set.weight, reps: set.reps })));
  const stagnant = older.every(log => {
    const volume = calculateExerciseVolume((log.sets ?? []).map(set => ({ weight: set.weight, reps: set.reps })));
    return volume <= latestVolume;
  });

  return {
    exerciseId,
    isPlateau: stagnant,
    reason: stagnant ? 'Possível platô: sem aumento de volume nas últimas 3 sessões.' : undefined,
  };
}

export function suggestInitialExerciseDraft(exerciseId: string, history: WorkoutSession[]): ExerciseAutofillSuggestion {
  const last = history.flatMap(s => s.exercises).find(ex => ex.exerciseId === exerciseId);
  if (!last) return { exerciseId, hasSuggestion: false };

  const firstSet = last.sets?.[0];
  return {
    exerciseId,
    hasSuggestion: true,
    weight: firstSet?.weight ? String(firstSet.weight) : String(last.actualWeight ?? ''),
    reps: firstSet?.reps ? String(firstSet.reps) : String(last.actualReps ?? ''),
    rpe: firstSet?.rpe ? String(firstSet.rpe) : String(last.rpe ?? '8'),
  };
}

export function buildActiveWorkoutSummary(draft: ActiveExerciseDraft[]): ActiveWorkoutSummary {
  const progress = calculateWorkoutProgress(draft);
  const tonnage = calculateWorkoutTonnage(draft);
  const rpeValues = draft
    .flatMap(ex => ex.sets)
    .map(set => parseValue(set.rpe))
    .filter(value => value > 0);

  const averageRpe = rpeValues.length
    ? Number((rpeValues.reduce((sum, value) => sum + value, 0) / rpeValues.length).toFixed(1))
    : 0;
  const accumulatedRpeLoad = Number(
    draft
      .flatMap(ex => ex.sets)
      .reduce((sum, set) => sum + (parseValue(set.rpe) * parseValue(set.reps)), 0)
      .toFixed(1)
  );

  return { progress, tonnage, averageRpe, accumulatedRpeLoad };
}

export function buildWorkoutExerciseLog(exercise: ActiveExerciseDraft): WorkoutExerciseLog {
  const parsedSets = exercise.sets.map(s => ({
    weight: parseValue(s.weight),
    reps: parseValue(s.reps),
    rpe: parseValue(s.rpe),
  }));

  return {
    ...exercise,
    sets: parsedSets,
    actualWeight: parsedSets[0]?.weight ?? 0,
    actualReps: parsedSets[0]?.reps ?? 0,
    rpe: parsedSets[0]?.rpe ?? 0,
  };
}
