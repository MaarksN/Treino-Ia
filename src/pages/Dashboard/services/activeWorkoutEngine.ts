import { type WorkoutExerciseLog, type WorkoutSession } from '../../../services/database';
import { type ActiveExerciseDraft, type DraftSet } from '../types';
import { parseDraftSetMetrics } from './dashboardValidation';

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

export interface RpeCalculatorOption {
  rirLabel: string;
  rpe: string;
  description: string;
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

export function parseRestSeconds(rest: string): number {
  const match = rest.match(/\d+/);
  if (!match) return 60;
  let value = parseInt(match[0]);
  if (rest.toLowerCase().includes('min')) value *= 60;
  return value;
}

export function calculateSetVolume(set: { weight: string | number; reps: string | number }): number {
  return parseValue(set.weight) * parseValue(set.reps);
}

export function calculateExerciseVolume(sets: Array<{ weight: string | number; reps: string | number }>): number {
  return sets.reduce((sum, set) => sum + calculateSetVolume(set), 0);
}

export function calculateWorkoutTonnage(draft: ActiveExerciseDraft[]): WorkoutTonnageSummary {
  const totalTonnage = draft.reduce((sum, exercise) => sum + calculateExerciseVolume(exercise.sets), 0);
  const completedTonnage = draft.reduce((sum, exercise) => (
    sum + calculateExerciseVolume(exercise.sets.filter(set => set.completed))
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

export function calculateRpeFromRir(rirInput: string | number): number {
  const rir = typeof rirInput === 'string'
    ? Number(rirInput.replace(',', '.'))
    : rirInput;

  if (!Number.isFinite(rir)) return 0;
  if (rir <= 0) return 10;
  if (rir >= 4) return 6;
  return Math.max(6, Math.min(10, 10 - Math.round(rir)));
}

export function calculateRirFromRpe(rpeInput: string | number): number | null {
  const rpe = parseValue(rpeInput);
  if (rpe < 6) return null;
  return Math.max(0, Math.round(10 - Math.min(10, rpe)));
}

export function getRpeCalculatorOptions(): RpeCalculatorOption[] {
  return [
    { rirLabel: '0', rpe: String(calculateRpeFromRir(0)), description: 'Falha total' },
    { rirLabel: '1', rpe: String(calculateRpeFromRir(1)), description: 'Mais 1 rep' },
    { rirLabel: '2', rpe: String(calculateRpeFromRir(2)), description: 'Mais 2 reps' },
    { rirLabel: '3', rpe: String(calculateRpeFromRir(3)), description: 'Mais 3 reps' },
    { rirLabel: '4+', rpe: String(calculateRpeFromRir(4)), description: 'Aquecimento' },
  ];
}

function getExerciseLogsByRecency(exerciseId: string, history: WorkoutSession[]): WorkoutExerciseLog[] {
  return [...history]
    .sort((a, b) => b.completedAt - a.completedAt)
    .flatMap(session => session.exercises)
    .filter(ex => ex.exerciseId === exerciseId);
}

export function detectSimplePlateau(exerciseId: string, history: WorkoutSession[]): PlateauSignal {
  const logs = getExerciseLogsByRecency(exerciseId, history).slice(0, 3);

  if (logs.length < 3) {
    return { exerciseId, isPlateau: false };
  }

  const [latest, previous, oldest] = logs.map(log => (
    calculateExerciseVolume((log.sets ?? []).map(set => ({ weight: set.weight, reps: set.reps })))
  ));
  const hasComparableVolume = [latest, previous, oldest].every(volume => volume > 0);
  const stagnant = hasComparableVolume && latest <= previous && previous <= oldest;

  return {
    exerciseId,
    isPlateau: stagnant,
    reason: stagnant ? 'Possível platô: sem aumento de volume nas últimas 3 sessões.' : undefined,
  };
}

export function suggestInitialExerciseDraft(exerciseId: string, history: WorkoutSession[]): ExerciseAutofillSuggestion {
  const last = getExerciseLogsByRecency(exerciseId, history).find(ex => (
    Boolean(ex.sets?.length) || Boolean(ex.actualWeight || ex.actualReps || ex.rpe)
  ));
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

export function applyAutofillSuggestion(set: DraftSet): DraftSet {
  return {
    ...set,
    weight: set.weight.trim() ? set.weight : set.suggestedWeight ?? set.weight,
    reps: set.reps.trim() ? set.reps : set.suggestedReps ?? set.reps,
    rpe: set.rpe.trim() ? set.rpe : set.suggestedRpe ?? set.rpe,
    autofillSuggested: false,
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
  const parsedSets = exercise.sets.map(parseDraftSetMetrics);

  return {
    ...exercise,
    sets: parsedSets,
    actualWeight: parsedSets[0]?.weight ?? 0,
    actualReps: parsedSets[0]?.reps ?? 0,
    rpe: parsedSets[0]?.rpe ?? 0,
  };
}
