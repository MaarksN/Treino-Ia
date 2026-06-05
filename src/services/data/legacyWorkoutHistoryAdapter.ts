import { buildWorkoutHistoryUpsert, readWorkoutSessionJson } from '../trainingReadModels';
import { getCurrentUserId, isSupabaseConfigured, supabase } from '../supabaseClient';
import type { WorkoutSession } from '../database';

const LEGACY_HISTORY_KEY = '@TreinoIA:history';

export interface LegacyWorkoutHistoryAdapter {
  saveLegacyJson(session: WorkoutSession): Promise<void>;
  getLegacyHistory(limit?: number): Promise<WorkoutSession[]>;
}

function readLocalHistory(): WorkoutSession[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(window.localStorage.getItem(LEGACY_HISTORY_KEY) || '[]') as WorkoutSession[];
  } catch {
    return [];
  }
}

function writeLocalHistory(history: WorkoutSession[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LEGACY_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export const legacyWorkoutHistoryAdapter: LegacyWorkoutHistoryAdapter = {
  async saveLegacyJson(session: WorkoutSession) {
    if (!isSupabaseConfigured) {
      writeLocalHistory([session, ...readLocalHistory().filter((item) => item.id !== session.id)]);
      return;
    }

    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('training_workout_history_records')
      .upsert(buildWorkoutHistoryUpsert(userId, session), { onConflict: 'user_id,id' });

    if (error) {
      throw error;
    }
  },

  async getLegacyHistory(limit = 50): Promise<WorkoutSession[]> {
    if (!isSupabaseConfigured) {
      return readLocalHistory().slice(0, limit);
    }

    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('training_workout_history_records')
      .select('record_json')
      .eq('user_id', userId)
      .order('workout_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get legacy JSON history', error);
      return [];
    }

    return (data ?? [])
      .map((row) => readWorkoutSessionJson(row))
      .filter((session): session is WorkoutSession => Boolean(session));
  },
};
