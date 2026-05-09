import { ExerciseLog, WorkoutHistoryRecord, WorkoutPlan } from '../types';

export function parseFirstNumber(value?: string | number) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const match = value.match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(',', '.')) : 0;
}

export function extractLogsFromPlan(plan: WorkoutPlan): ExerciseLog[] {
  return plan.days.flatMap(day =>
    day.exercises
      .filter(ex => ex.completed && (ex.actualWeight || ex.actualReps || ex.rpe))
      .map(ex => ({
        exerciseName: ex.name,
        date: plan.createdAt,
        actualWeight: ex.actualWeight,
        actualReps: ex.actualReps,
        rpe: ex.rpe,
      }))
  );
}

export function extractLogsFromHistory(records: WorkoutHistoryRecord[]): ExerciseLog[] {
  return records.flatMap(record =>
    record.exercises
      .filter(ex => ex.actualWeight || ex.actualReps || ex.rpe)
      .map(ex => ({
        exerciseName: ex.name,
        date: record.date,
        actualWeight: ex.actualWeight,
        actualReps: ex.actualReps,
        rpe: ex.rpe,
      }))
  );
}

function getExerciseLogs(plans: WorkoutPlan[], exerciseName: string, records: WorkoutHistoryRecord[] = []) {
  const sourceLogs = records.length
    ? extractLogsFromHistory(records)
    : plans.flatMap(plan => extractLogsFromPlan(plan));

  return sourceLogs
    .filter(log => log.exerciseName.toLowerCase() === exerciseName.toLowerCase())
    .sort((a, b) => a.date - b.date);
}

export function detectPlateau(
  plans: WorkoutPlan[],
  exerciseName: string,
  records: WorkoutHistoryRecord[] = []
) {
  const weights = getExerciseLogs(plans, exerciseName, records)
    .map(log => log.actualWeight || 0)
    .filter(weight => weight > 0);

  if (weights.length < 3) return { plateau: false, reason: 'Poucos dados para prever platô.' };

  const last3 = weights.slice(-3);
  const max = Math.max(...last3);
  const min = Math.min(...last3);

  if (max - min <= 1) {
    return { plateau: true, reason: 'Carga estagnada nas últimas 3 sessões.' };
  }

  return { plateau: false, reason: 'Progressão normal.' };
}

export function shouldSuggestDeload(plan: WorkoutPlan) {
  const exercises = plan.days.flatMap(day => day.exercises);
  const hardCount = exercises.filter(ex => ex.feedback === 'hard').length;
  const painCount = exercises.filter(ex => ex.feedback === 'painful').length;
  const rpeValues = exercises.map(ex => ex.rpe).filter((rpe): rpe is number => Boolean(rpe));
  const avgRpe = rpeValues.reduce((sum, rpe) => sum + rpe, 0) / Math.max(1, rpeValues.length);

  return hardCount >= 4 || painCount >= 1 || avgRpe >= 8.5;
}
