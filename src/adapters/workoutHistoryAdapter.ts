import type { WorkoutSession, WorkoutExerciseLog, ExerciseSet } from '../services/database';

/**
 * Adapter to safely convert unknown historical workout data (usually WorkoutHistoryRecord[] from the AppStore)
 * into the strict WorkoutSession[] format expected by the Progression Engine.
 */
export function mapWorkoutHistoryToWorkoutSessions(history: unknown[]): WorkoutSession[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.map(record => {
    if (!record || typeof record !== 'object') return null;

    // Cast as any for defensive extraction
    const anyRecord = record as any;

    // Normalize exercises array safely
    const rawExercises = Array.isArray(anyRecord.exercises) ? anyRecord.exercises : [];

    const exercises: WorkoutExerciseLog[] = rawExercises.map((ex: any) => {
      if (!ex || typeof ex !== 'object') return null;

      let parsedSets: ExerciseSet[] = [];

      // If payload comes from WorkoutHistoryRecord (store), it uses `setLogs`
      if (Array.isArray(ex.setLogs)) {
        parsedSets = ex.setLogs.map((s: any) => ({
          weight: Number(s?.weight) || Number(ex.actualWeight) || 0,
          reps: Number(s?.reps) || 0,
          rpe: Number(s?.rpe) || Number(ex.rpe) || 0,
        }));
      } 
      // If it already follows WorkoutExerciseLog format, it uses `sets`
      else if (Array.isArray(ex.sets)) {
        parsedSets = ex.sets.map((s: any) => ({
          weight: Number(s?.weight) || 0,
          reps: Number(s?.reps) || 0,
          rpe: Number(s?.rpe) || 0,
        }));
      }

      return {
        exerciseId: String(ex.id || ex.exerciseId || ''),
        name: String(ex.name || ex.exerciseName || 'Exercício Desconhecido'),
        targetSets: Number(ex.sets) || 0, // In the store Exercise, `sets` is a number
        targetReps: String(ex.reps || ''),
        targetRest: String(ex.rest || ''),
        completed: Boolean(ex.completed),
        sets: parsedSets,
        actualWeight: Number(ex.actualWeight) || 0,
        actualReps: Number(ex.actualReps) || 0,
        rpe: Number(ex.rpe) || 0,
      } as WorkoutExerciseLog;
    }).filter(Boolean);

    return {
      id: String(anyRecord.id || ''),
      planId: String(anyRecord.planId || ''),
      dayId: String(anyRecord.dayId || ''),
      dayName: String(anyRecord.dayName || ''),
      focus: String(anyRecord.focus || ''),
      completedAt: Number(anyRecord.date || anyRecord.completedAt || Date.now()),
      durationMinutes: Number(anyRecord.durationMinutes) || 0,
      totalVolume: Number(anyRecord.volumeLoad || anyRecord.totalVolume) || 0,
      completedExercises: exercises.length,
      totalExercises: exercises.length,
      feedback: '',
      nextRecommendation: '',
      exercises,
    } as WorkoutSession;
  }).filter(Boolean) as WorkoutSession[];
}
