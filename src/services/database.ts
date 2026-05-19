import { isSupabaseConfigured, supabase } from './supabaseClient';
import {
  buildTrainingPlanUpsert,
  buildTrainingProfileUpsert,
  buildWorkoutHistoryUpsert,
  readTrainingPlanJson,
  readTrainingProfileJson,
  readWorkoutSessionJson,
} from './trainingReadModels';

import type {
  ExerciseIntensityTechnique,
  PersistenceStatus,
  TrainingLevel,
  TrainingPlan,
  UserProfile,
  WorkoutSession,
} from './database/database.types';

export type * from './database/database.types';

const STORAGE_KEYS = {
  profile: '@TreinoIA:profile',
  plan: '@TreinoIA:currentPlan',
  history: '@TreinoIA:history',
};

const validLevels: TrainingLevel[] = ['iniciante', 'intermediario', 'avancado'];

function createId(prefix: string) {
  const uuid = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `${prefix}_${uuid}`;
}

export function createDefaultProfile(): UserProfile {
  return {
    id: createId('profile'),
    name: 'Atleta',
    level: 'intermediario',
    goal: 'Hipertrofia',
    daysPerWeek: 4,
    timePerWorkout: 45,
    injuries: 'Nenhuma',
    equipment: 'Academia completa',
    updatedAt: Date.now(),
  };
}

export function normalizeProfile(profile: Partial<UserProfile> | null | undefined): UserProfile {
  const base = createDefaultProfile();
  const level = profile?.level && validLevels.includes(profile.level)
    ? profile.level
    : base.level;

  return {
    id: profile?.id || base.id,
    name: profile?.name?.trim() || base.name,
    level,
    goal: profile?.goal?.trim() || base.goal,
    daysPerWeek: clampNumber(profile?.daysPerWeek, 1, 6, base.daysPerWeek),
    timePerWorkout: clampNumber(profile?.timePerWorkout, 20, 120, base.timePerWorkout),
    injuries: profile?.injuries?.trim() || base.injuries,
    equipment: profile?.equipment?.trim() || base.equipment,
    updatedAt: profile?.updatedAt || Date.now(),
  };
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function getCloudUser() {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.id) return null;
    return data.user;
  } catch {
    return null;
  }
}

async function getCloudUserId() {
  return (await getCloudUser())?.id ?? null;
}

async function tryCloud<T>(operation: (userId: string) => Promise<T>): Promise<T | null> {
  const userId = await getCloudUserId();
  if (!userId) return null;

  try {
    return await operation(userId);
  } catch (error) {
    console.warn('Falha ao usar Supabase. Fallback local ativado.', error);
    return null;
  }
}

export const DatabaseService = {
  getPersistenceStatus: async (): Promise<PersistenceStatus> => {
    if (!isSupabaseConfigured) {
      return {
        mode: 'local',
        configured: false,
        authenticated: false,
        email: null,
        message: 'Supabase nao configurado. Dados salvos neste navegador.',
      };
    }

    const user = await getCloudUser();
    if (!user) {
      return {
        mode: 'local',
        configured: true,
        authenticated: false,
        email: null,
        message: 'Supabase configurado. Entre para sincronizar na nuvem.',
      };
    }

    return {
      mode: 'supabase',
      configured: true,
      authenticated: true,
      email: user.email ?? null,
      message: 'Supabase conectado. Dados sincronizados na nuvem.',
    };
  },

  signUp: async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase nao configurado.');
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },

  signIn: async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase nao configurado.');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signOut: async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  },

  saveProfile: async (profile: UserProfile): Promise<boolean> => {
    const normalized = normalizeProfile({ ...profile, updatedAt: Date.now() });

    const cloudSaved = await tryCloud(async userId => {
      const { error } = await supabase
        .from('training_user_profiles')
        .upsert(buildTrainingProfileUpsert(userId, normalized), { onConflict: 'user_id' });

      if (error) throw error;
      return true;
    });

    if (cloudSaved) return true;

    writeLocal(STORAGE_KEYS.profile, normalized);
    return true;
  },

  getProfile: async (): Promise<UserProfile | null> => {
    const cloudProfile = await tryCloud(async userId => {
      const { data, error } = await supabase
        .from('training_user_profiles')
        .select('profile_json')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      const profileJson = readTrainingProfileJson(data);
      return profileJson ? normalizeProfile(profileJson) : null;
    });

    if (cloudProfile) return cloudProfile;

    const localProfile = readLocal<Partial<UserProfile> | null>(STORAGE_KEYS.profile, null);
    return localProfile ? normalizeProfile(localProfile) : null;
  },

  saveCurrentPlan: async (plan: TrainingPlan): Promise<boolean> => {
    const cloudSaved = await tryCloud(async userId => {
      await supabase
        .from('training_workout_plans')
        .update({ is_current: false })
        .eq('user_id', userId)
        .neq('id', plan.id);

      const { error } = await supabase
        .from('training_workout_plans')
        .upsert(buildTrainingPlanUpsert(userId, plan), { onConflict: 'user_id,id' });

      if (error) throw error;
      return true;
    });

    if (cloudSaved) return true;

    writeLocal(STORAGE_KEYS.plan, plan);
    return true;
  },

  getCurrentPlan: async (): Promise<TrainingPlan | null> => {
    const cloudPlan = await tryCloud(async userId => {
      const { data, error } = await supabase
        .from('training_workout_plans')
        .select('plan_json')
        .eq('user_id', userId)
        .eq('is_current', true)
        .order('created_at_ms', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return readTrainingPlanJson(data);
    });

    if (cloudPlan) return cloudPlan;
    return readLocal<TrainingPlan | null>(STORAGE_KEYS.plan, null);
  },

  saveWorkoutSession: async (session: WorkoutSession): Promise<boolean> => {
    const cloudSaved = await tryCloud(async userId => {
      const { error } = await supabase
        .from('training_workout_history_records')
        .upsert(buildWorkoutHistoryUpsert(userId, session), { onConflict: 'user_id,id' });

      if (error) throw error;
      return true;
    });

    if (cloudSaved) return true;

    const history = readLocal<WorkoutSession[]>(STORAGE_KEYS.history, []);
    writeLocal(STORAGE_KEYS.history, [session, ...history].slice(0, 50));
    return true;
  },

  getWorkoutHistory: async (): Promise<WorkoutSession[]> => {
    const cloudHistory = await tryCloud(async userId => {
      const { data, error } = await supabase
        .from('training_workout_history_records')
        .select('record_json')
        .eq('user_id', userId)
        .order('workout_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data ?? [])
        .map(row => readWorkoutSessionJson(row))
        .filter((session): session is WorkoutSession => Boolean(session));
    });

    if (cloudHistory) return cloudHistory;
    return readLocal<WorkoutSession[]>(STORAGE_KEYS.history, []);
  },

  migrateLocalToCloud: async (): Promise<void> => {
    const userId = await getCloudUserId();
    if (!userId) return;

    const profile = readLocal<Partial<UserProfile> | null>(STORAGE_KEYS.profile, null);
    const plan = readLocal<TrainingPlan | null>(STORAGE_KEYS.plan, null);
    const history = readLocal<WorkoutSession[]>(STORAGE_KEYS.history, []);

    if (profile) await DatabaseService.saveProfile(normalizeProfile(profile));
    if (plan) await DatabaseService.saveCurrentPlan(plan);
    for (const session of history) {
      await DatabaseService.saveWorkoutSession(session);
    }
  },
};
