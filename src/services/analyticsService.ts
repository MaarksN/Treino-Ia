import { WorkoutHistoryRecord, WorkoutPlan } from '../types';
import { parseFirstNumber } from '../utils/workoutMetrics';

export interface ExerciseHistoryPoint {
  label: string;
  date: number;
  weight: number;
  reps: number;
  rpe: number;
}

export function getExerciseHistoryData(
  plans: WorkoutPlan[],
  exerciseName: string,
  workoutHistory: WorkoutHistoryRecord[] = []
): ExerciseHistoryPoint[] {
  const normalizedName = exerciseName.toLowerCase();

  if (workoutHistory.length > 0) {
    return workoutHistory
      .slice()
      .sort((a, b) => a.date - b.date)
      .map(record => {
        const match = record.exercises.find(ex => ex.name.toLowerCase() === normalizedName);
        return {
          label: new Date(record.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          date: record.date,
          weight: match?.actualWeight || 0,
          reps: parseFirstNumber(match?.actualReps),
          rpe: match?.rpe || 0,
        };
      })
      .filter(item => item.weight > 0 || item.reps > 0 || item.rpe > 0);
  }

  return plans
    .slice()
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .map((plan, index) => {
      const match = plan.days
        .flatMap(day => day.exercises)
        .find(ex => ex.name.toLowerCase() === normalizedName);

      return {
        label: `Sessão ${index + 1}`,
        date: plan.createdAt || Date.now(),
        weight: match?.actualWeight || 0,
        reps: parseFirstNumber(match?.actualReps),
        rpe: match?.rpe || 0,
      };
    })
    .filter(item => item.weight > 0 || item.reps > 0 || item.rpe > 0);
}

export function getTrackedExerciseNames(plans: WorkoutPlan[], workoutHistory: WorkoutHistoryRecord[] = []) {
  const names = new Set<string>();

  workoutHistory.forEach(record => {
    record.exercises.forEach(ex => {
      if (ex.actualWeight || ex.actualReps || ex.rpe) names.add(ex.name);
    });
  });

  plans.forEach(plan => {
    plan.days.forEach(day => {
      day.exercises.forEach(ex => names.add(ex.name));
    });
  });

  return Array.from(names).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
