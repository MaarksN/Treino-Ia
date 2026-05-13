import { isSupabaseConfigured, supabase } from './supabaseClient';

export type TrainingLevel = 'iniciante' | 'intermediario' | 'avancado';

export interface UserProfile {
  id: string;
  name: string;
  level: TrainingLevel;
  goal: string;
  daysPerWeek: number;
  timePerWorkout: number;
  injuries: string;
  equipment: string;
  updatedAt?: number;
}

export interface ExercisePrescription {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  rest: string;
  notes: string;
}

export interface WorkoutDayPlan {
  id: string;
  dayName: string;
  focus: string;
  exercises: ExercisePrescription[];
}

export interface TrainingPlan {
  id: string;
  createdAt: number;
  planName: string;
  goalDescription: string;
  volume: string;
  frequency: string;
  focus: string;
  weeklySplit: string;
  aiRecommendation: string;
  nextRecommendation: string;
  days: WorkoutDayPlan[];
}

export interface WorkoutExerciseLog {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: string;
  targetRest: string;
  completed: boolean;
  actualWeight: number;
  actualReps: number;
  rpe: number;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  dayId: string;
  dayName: string;
  focus: string;
  completedAt: number;
  durationMinutes: number;
  totalVolume: number;
  completedExercises: number;
  totalExercises: number;
  feedback: string;
  nextRecommendation: string;
  exercises: WorkoutExerciseLog[];
}

export interface PersistenceStatus {
  mode: 'supabase' | 'local';
  configured: boolean;
  authenticated: boolean;
  email: string | null;
  message: string;
}

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
        .upsert({
          user_id: userId,
          profile_json: normalized,
          profile_goal: normalized.goal,
          profile_name: normalized.name,
        }, { onConflict: 'user_id' });

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
      const row = data as { profile_json?: Partial<UserProfile> } | null;
      return row?.profile_json ? normalizeProfile(row.profile_json) : null;
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
        .upsert({
          user_id: userId,
          id: plan.id,
          plan_name: plan.planName,
          goal_description: plan.goalDescription,
          created_at_ms: plan.createdAt,
          is_current: true,
          plan_json: plan,
        }, { onConflict: 'user_id,id' });

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
      const row = data as { plan_json?: TrainingPlan } | null;
      return row?.plan_json ?? null;
    });

    if (cloudPlan) return cloudPlan;
    return readLocal<TrainingPlan | null>(STORAGE_KEYS.plan, null);
  },

  saveWorkoutSession: async (session: WorkoutSession): Promise<boolean> => {
    const cloudSaved = await tryCloud(async userId => {
      const { error } = await supabase
        .from('training_workout_history_records')
        .upsert({
          user_id: userId,
          id: session.id,
          workout_date: new Date(session.completedAt).toISOString(),
          plan_id: session.planId,
          day_id: session.dayId,
          day_name: session.dayName,
          focus: session.focus,
          volume_load: session.totalVolume,
          duration_minutes: session.durationMinutes,
          record_json: session,
        }, { onConflict: 'user_id,id' });

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
      return ((data ?? []) as Array<{ record_json?: WorkoutSession }>)
        .map(row => row.record_json)
        .filter(Boolean) as WorkoutSession[];
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
