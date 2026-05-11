import { Exercise, PersonalRecord, SetLog, WorkoutDay, WorkoutHistoryRecord, WorkoutPlan, WorkoutSession } from '../types';
import { DataMode, LastExercisePerformance, WorkoutExecutionPayload, WorkoutExecutionPersistResult } from '../types/trainingExecution';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const DEV_EXECUTIONS_KEY = '@TreinoApp:workoutExecutions:mock_dev_only';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function loadDevExecutions(): WorkoutExecutionPayload[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(DEV_EXECUTIONS_KEY) || '[]') as WorkoutExecutionPayload[];
  } catch {
    return [];
  }
}

function parseFirstReps(value?: string) {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function numberOrUndefined(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function sanitizeSetLog(log: SetLog): SetLog {
  const weight = numberOrUndefined(log.weight);
  const reps = numberOrUndefined(log.reps);
  const rpe = Number(log.rpe);

  return {
    setNumber: Math.max(1, Math.floor(Number(log.setNumber) || 1)),
    weight,
    reps,
    rpe: Number.isFinite(rpe) && rpe >= 1 && rpe <= 10 ? rpe : undefined,
    failed: Boolean(log.failed),
    technicalFailure: Boolean(log.technicalFailure),
    note: typeof log.note === 'string' ? log.note.slice(0, 240) : undefined,
    completedAt: log.completedAt,
  };
}

export function getExerciseCompletedSets(exercise: Exercise) {
  return (exercise.setLogs || []).map(sanitizeSetLog).filter(log => Boolean(log.completedAt || log.weight || log.reps || log.rpe));
}

export function calculateExerciseVolume(exercise: Exercise) {
  const completedSets = getExerciseCompletedSets(exercise);
  if (completedSets.length) {
    return completedSets.reduce((sum, log) => sum + ((log.weight || 0) * (log.reps || 0)), 0);
  }

  return (exercise.actualWeight || 0) * parseFirstReps(exercise.actualReps || exercise.reps) * exercise.sets;
}

export function calculateDayVolume(day: WorkoutDay) {
  return day.exercises.reduce((sum, exercise) => sum + calculateExerciseVolume(exercise), 0);
}

export function buildWorkoutRecord(plan: WorkoutPlan, day: WorkoutDay, durationMinutes: number): WorkoutHistoryRecord {
  return {
    id: crypto.randomUUID(),
    date: Date.now(),
    planId: plan.id,
    dayId: day.id,
    dayName: day.dayName,
    focus: day.focus,
    volumeLoad: calculateDayVolume(day),
    durationMinutes,
    exercises: JSON.parse(JSON.stringify(day.exercises)),
  };
}

export function buildWorkoutSession(plan: WorkoutPlan, day: WorkoutDay, durationMinutes: number, readiness?: WorkoutSession['readiness']): WorkoutSession {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    planId: plan.id,
    dayId: day.id,
    completedAt: now,
    durationMinutes,
    readiness,
    logs: day.exercises
      .filter(exercise =>
        exercise.completed ||
        exercise.actualWeight ||
        exercise.actualReps ||
        exercise.rpe ||
        exercise.feedback ||
        exercise.performanceNotes ||
        getExerciseCompletedSets(exercise).length
      )
      .map(exercise => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        date: now,
        actualWeight: exercise.actualWeight,
        actualReps: exercise.actualReps,
        rpe: exercise.rpe,
        setLogs: getExerciseCompletedSets(exercise),
        feedback: exercise.feedback,
        performanceNotes: exercise.performanceNotes,
      })),
  };
}

export function extractPersonalRecords(plan: WorkoutPlan, day: WorkoutDay): PersonalRecord[] {
  const records = new Map<string, PersonalRecord>();

  day.exercises.forEach(exercise => {
    const bestSet = getExerciseCompletedSets(exercise)
      .filter(log => log.weight && log.reps)
      .sort((a, b) => (b.weight || 0) - (a.weight || 0) || (b.reps || 0) - (a.reps || 0))[0];

    const weight = bestSet?.weight || exercise.actualWeight;
    const reps = bestSet?.reps || parseFirstReps(exercise.actualReps);

    if (weight && reps) {
      const next: PersonalRecord = {
        exerciseName: exercise.name,
        weight,
        reps,
        date: Date.now(),
        planId: plan.id,
      };
      const current = records.get(exercise.name);
      if (!current || next.weight > current.weight || (next.weight === current.weight && next.reps > current.reps)) {
        records.set(exercise.name, next);
      }
    }
  });

  return Array.from(records.values());
}

export function getLastExercisePerformance(
  exerciseName: string,
  workoutHistory: WorkoutHistoryRecord[],
  sessions: WorkoutSession[] = [],
): LastExercisePerformance | null {
  const normalized = exerciseName.toLowerCase();

  for (let i = workoutHistory.length - 1; i >= 0; i--) {
    const found = workoutHistory[i].exercises.find(exercise =>
      exercise.name.toLowerCase() === normalized &&
      (exercise.actualWeight || exercise.actualReps || exercise.rpe || exercise.setLogs?.length)
    );
    if (found) return { exercise: found, source: 'workout_history' };
  }

  for (let i = sessions.length - 1; i >= 0; i--) {
    const found = sessions[i].logs.find(log => log.exerciseName.toLowerCase() === normalized);
    if (found) {
      return {
        source: 'session',
        exercise: {
          id: found.exerciseId || found.exerciseName,
          name: found.exerciseName,
          sets: found.setLogs?.length || 1,
          reps: found.actualReps || '',
          rest: '90s',
          actualWeight: found.actualWeight,
          actualReps: found.actualReps,
          rpe: found.rpe,
          setLogs: found.setLogs,
          feedback: found.feedback,
          performanceNotes: found.performanceNotes,
        },
      };
    }
  }

  return null;
}

async function getAuthUserId() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) return null;
  return data.user.id;
}

function persistDevExecution(payload: WorkoutExecutionPayload): WorkoutExecutionPersistResult {
  if (canUseStorage()) {
    const current = loadDevExecutions();
    window.localStorage.setItem(DEV_EXECUTIONS_KEY, JSON.stringify([...current, payload]));
  }

  return {
    dataMode: 'mock_dev_only',
    recordId: payload.record.id,
    warning: 'Supabase não está configurado ou o usuário não está autenticado; execução salva apenas para desenvolvimento local.',
  };
}

export async function persistWorkoutExecution(payload: WorkoutExecutionPayload): Promise<WorkoutExecutionPersistResult> {
  const userId = await getAuthUserId();
  if (!userId) return persistDevExecution(payload);

  const { error: sessionError } = await supabase.from('workout_execution_sessions').upsert({
    id: payload.record.id,
    user_id: userId,
    plan_id: payload.record.planId,
    day_id: payload.record.dayId,
    day_name: payload.record.dayName,
    focus: payload.record.focus,
    volume_load: payload.record.volumeLoad,
    duration_minutes: payload.record.durationMinutes,
    completed_at: new Date(payload.record.date).toISOString(),
    workout_json: payload.record,
  });

  if (sessionError) throw new Error(`Falha ao salvar sessão de treino: ${sessionError.message}`);

  const setRows = payload.record.exercises.flatMap(exercise =>
    getExerciseCompletedSets(exercise).map(log => ({
      user_id: userId,
      session_id: payload.record.id,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      set_number: log.setNumber,
      weight: log.weight,
      reps: log.reps,
      rpe: log.rpe,
      failed_concentric: log.failed,
      failed_technical: log.technicalFailure,
      note: log.note,
      completed_at: log.completedAt ? new Date(log.completedAt).toISOString() : new Date(payload.record.date).toISOString(),
    }))
  );

  if (setRows.length) {
    const { error: setError } = await supabase.from('workout_execution_sets').insert(setRows);
    if (setError) throw new Error(`Falha ao salvar séries: ${setError.message}`);
  }

  if (payload.personalRecords.length) {
    const names = payload.personalRecords.map(pr => pr.exerciseName);
    const { data: existingPrs, error: existingPrError } = await supabase
      .from('personal_records')
      .select('exercise_name, weight, reps')
      .in('exercise_name', names);
    if (existingPrError) throw new Error(`Falha ao consultar PRs: ${existingPrError.message}`);

    const existingMap = new Map((existingPrs || []).map(row => [row.exercise_name, row]));
    const prsToUpsert = payload.personalRecords.filter(pr => {
      const current = existingMap.get(pr.exerciseName);
      if (!current) return true;
      return pr.weight > Number(current.weight) || (pr.weight === Number(current.weight) && pr.reps > Number(current.reps));
    });

    if (!prsToUpsert.length) return { dataMode: 'supabase', recordId: payload.record.id };

    const { error: prError } = await supabase.from('personal_records').upsert(
      prsToUpsert.map(pr => ({
        user_id: userId,
        exercise_name: pr.exerciseName,
        weight: pr.weight,
        reps: pr.reps,
        plan_id: pr.planId,
        achieved_at: new Date(pr.date).toISOString(),
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'user_id,exercise_name' },
    );
    if (prError) throw new Error(`Falha ao salvar PRs: ${prError.message}`);
  }

  return { dataMode: 'supabase', recordId: payload.record.id };
}

export function resetCompletedDay(day: WorkoutDay): WorkoutDay {
  return {
    ...day,
    workoutFeedback: undefined,
    exercises: day.exercises.map(exercise => ({
      ...exercise,
      completed: false,
      actualWeight: undefined,
      actualReps: undefined,
      rpe: undefined,
      feedback: undefined,
      performanceNotes: undefined,
      setLogs: undefined,
    })),
  };
}

export function dataModeLabel(dataMode: DataMode) {
  return dataMode === 'supabase' ? 'Supabase' : 'mock_dev_only';
}
