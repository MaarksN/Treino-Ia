import { getCurrentUserId, isSupabaseConfigured, supabase } from '../supabaseClient';
import type { WorkoutExerciseLog, WorkoutSession } from '../database';

export interface RelationalSession {
  id?: string;
  legacy_session_id?: string;
  plan_id?: string;
  day_id?: string;
  day_name?: string;
  focus?: string;
  started_at: string;
  finished_at?: string;
  status: string;
  total_volume: number;
  duration_seconds?: number;
  metadata_json?: Record<string, unknown>;
}

export interface RelationalExerciseLog {
  id?: string;
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  order_index: number;
  target_sets?: number;
  target_reps?: string;
  target_rest?: string;
  completed?: boolean;
  exercise_note?: string;
}

export interface RelationalSetLog {
  id?: string;
  exercise_log_id: string;
  session_id: string;
  set_index: number;
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  is_personal_record: boolean;
}

interface RelationalWorkoutRow {
  id: string;
  legacy_session_id?: string | null;
  plan_id?: string | null;
  day_id?: string | null;
  day_name?: string | null;
  focus?: string | null;
  finished_at?: string | null;
  total_volume?: number | null;
  duration_seconds?: number | null;
  metadata_json?: Record<string, unknown> | null;
  exercise_logs?: Array<{
    exercise_id: string;
    exercise_name: string;
    target_sets?: number | null;
    target_reps?: string | null;
    target_rest?: string | null;
    completed?: boolean | null;
    exercise_note?: string | null;
    set_logs?: Array<{
      weight?: number | null;
      reps?: number | null;
      rpe?: number | null;
      completed?: boolean | null;
    }>;
  }>;
}

function toNumber(value: unknown, fallback = 0): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function calculateSetVolume(set: Pick<RelationalSetLog, 'weight' | 'reps'>): number {
  return Math.max(0, toNumber(set.weight)) * Math.max(0, toNumber(set.reps));
}

export function isPersonalRecord(candidateValue: number, previousBestValue: number | null | undefined): boolean {
  return Number.isFinite(candidateValue) && candidateValue > 0 && candidateValue > toNumber(previousBestValue);
}

function getBestCompletedSet(exercise: WorkoutExerciseLog): { value: number; weight: number; reps: number; rpe?: number } | null {
  const best = (exercise.sets ?? [])
    .map(set => ({
      value: calculateSetVolume({
        weight: toNumber(set.weight),
        reps: toNumber(set.reps),
      }),
      weight: toNumber(set.weight),
      reps: toNumber(set.reps),
      rpe: Number.isFinite(Number(set.rpe)) ? Number(set.rpe) : undefined,
    }))
    .sort((left, right) => right.value - left.value)[0];

  return best && best.value > 0 ? best : null;
}

export function buildRelationalSession(session: WorkoutSession): RelationalSession {
  const durationMinutes = Math.max(0, toNumber(session.durationMinutes));

  return {
    legacy_session_id: session.id,
    plan_id: session.planId,
    day_id: session.dayId,
    day_name: session.dayName,
    focus: session.focus,
    started_at: new Date(session.completedAt - durationMinutes * 60_000).toISOString(),
    finished_at: new Date(session.completedAt).toISOString(),
    status: 'completed',
    total_volume: toNumber(session.totalVolume),
    duration_seconds: durationMinutes * 60,
    metadata_json: {
      completedExercises: session.completedExercises,
      totalExercises: session.totalExercises,
      feedback: session.feedback,
      nextRecommendation: session.nextRecommendation,
    },
  };
}

function mapRelationalRow(row: RelationalWorkoutRow): WorkoutSession {
  const metadata = row.metadata_json ?? {};
  const exercises = (row.exercise_logs ?? []).map(exercise => ({
    exerciseId: exercise.exercise_id,
    name: exercise.exercise_name,
    targetSets: toNumber(exercise.target_sets),
    targetReps: exercise.target_reps ?? '',
    targetRest: exercise.target_rest ?? '',
    completed: Boolean(exercise.completed),
    exerciseNote: exercise.exercise_note ?? undefined,
    sets: (exercise.set_logs ?? []).map(set => ({
      weight: toNumber(set.weight),
      reps: toNumber(set.reps),
      rpe: toNumber(set.rpe),
    })),
  }));

  return {
    id: row.legacy_session_id ?? row.id,
    planId: row.plan_id ?? '',
    dayId: row.day_id ?? '',
    dayName: row.day_name ?? '',
    focus: row.focus ?? '',
    completedAt: row.finished_at ? new Date(row.finished_at).getTime() : Date.now(),
    durationMinutes: Math.round(toNumber(row.duration_seconds) / 60),
    totalVolume: toNumber(row.total_volume),
    completedExercises: toNumber(metadata.completedExercises, exercises.filter(exercise => exercise.completed).length),
    totalExercises: toNumber(metadata.totalExercises, exercises.length),
    feedback: typeof metadata.feedback === 'string' ? metadata.feedback : '',
    nextRecommendation: typeof metadata.nextRecommendation === 'string' ? metadata.nextRecommendation : '',
    exercises,
  };
}

async function getPreviousPersonalRecordValue(userId: string, exerciseId: string): Promise<number> {
  const { data, error } = await supabase
    .from('personal_records')
    .select('value')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .eq('record_type', 'set_volume')
    .order('value', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return 0;
  return toNumber((data as { value?: unknown } | null)?.value);
}

export const workoutSessionRepository = {
  async createSession(session: Omit<RelationalSession, 'id'>): Promise<string | null> {
    if (!isSupabaseConfigured) return null;

    const userId = await getCurrentUserId();
    const row = {
      user_id: userId,
      ...session,
    };
    const query = session.legacy_session_id
      ? supabase.from('workout_sessions').upsert(row, { onConflict: 'user_id,legacy_session_id' })
      : supabase.from('workout_sessions').insert(row);

    const { data, error } = await query.select('id').single();

    if (error) {
      console.error('Error creating workout session', error);
      return null;
    }

    return (data as { id?: string } | null)?.id ?? null;
  },

  async addExerciseLog(log: Omit<RelationalExerciseLog, 'id'>): Promise<string | null> {
    if (!isSupabaseConfigured) return null;

    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('exercise_logs')
      .insert({
        user_id: userId,
        ...log,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding exercise log', error);
      return null;
    }

    return (data as { id?: string } | null)?.id ?? null;
  },

  async addSetLogs(sets: Omit<RelationalSetLog, 'id'>[]): Promise<void> {
    if (!isSupabaseConfigured || sets.length === 0) return;

    const userId = await getCurrentUserId();
    const mappedSets = sets.map(set => ({
      user_id: userId,
      ...set,
    }));

    const { error } = await supabase.from('set_logs').insert(mappedSets);
    if (error) {
      console.error('Error adding set logs', error);
    }
  },

  async saveCompletedSession(session: WorkoutSession): Promise<string | null> {
    if (!isSupabaseConfigured) return null;

    const userId = await getCurrentUserId();
    const sessionId = await this.createSession(buildRelationalSession(session));
    if (!sessionId) return null;

    for (const [exerciseIndex, exercise] of session.exercises.entries()) {
      const bestSet = getBestCompletedSet(exercise);
      const previousBestValue = await getPreviousPersonalRecordValue(userId, exercise.exerciseId);
      const personalRecord = bestSet ? isPersonalRecord(bestSet.value, previousBestValue) : false;
      const exerciseLogId = await this.addExerciseLog({
        session_id: sessionId,
        exercise_id: exercise.exerciseId,
        exercise_name: exercise.name,
        order_index: exerciseIndex,
        target_sets: exercise.targetSets,
        target_reps: exercise.targetReps,
        target_rest: exercise.targetRest,
        completed: exercise.completed,
        exercise_note: exercise.exerciseNote,
      });

      if (!exerciseLogId) continue;

      await this.addSetLogs((exercise.sets ?? []).map((set, setIndex) => ({
        exercise_log_id: exerciseLogId,
        session_id: sessionId,
        set_index: setIndex,
        weight: toNumber(set.weight),
        reps: toNumber(set.reps),
        rpe: Number.isFinite(Number(set.rpe)) ? Number(set.rpe) : undefined,
        completed: exercise.completed,
        is_personal_record: personalRecord && bestSet?.value === calculateSetVolume({
          weight: toNumber(set.weight),
          reps: toNumber(set.reps),
        }),
      })));

      if (personalRecord && bestSet) {
        await supabase.from('personal_records').insert({
          user_id: userId,
          exercise_id: exercise.exerciseId,
          exercise_name: exercise.name,
          record_type: 'set_volume',
          value: bestSet.value,
          unit: 'kg_reps',
          source_session_id: sessionId,
        });
      }
    }

    return sessionId;
  },

  async listCompletedSessions(limit = 50): Promise<WorkoutSession[]> {
    if (!isSupabaseConfigured) return [];

    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        exercise_logs (
          *,
          set_logs (*)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('finished_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error listing workout sessions', error);
      return [];
    }

    return ((data ?? []) as RelationalWorkoutRow[]).map(mapRelationalRow);
  },
};
