import { User, UserProfile, WorkoutHistoryRecord, WorkoutPlan } from '../types';
import { DataMode, PersistResult } from '../types/trainingExecution';
import { sanitizeText } from '../utils/inputSanitizer';
import { STORAGE_KEYS } from '../utils/storage';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const DEV_SYNC_KEY = '@TreinoApp:legacyTrainingBackend:mock_dev_only';
const DEV_WARNING =
  'Supabase nao configurado ou usuario nao autenticado; migracao legado perfil/plano/historico registrada como mock_dev_only local.';

const MAX_PROFILE_JSON_LENGTH = 60_000;
const MAX_PLAN_JSON_LENGTH = 260_000;
const MAX_HISTORY_JSON_LENGTH = 220_000;
const MAX_PLANS_TO_SYNC = 40;
const MAX_HISTORY_TO_SYNC = 600;

type SupabaseErrorLike = { message?: string } | null | undefined;

export interface LegacyTrainingState {
  user: User | null;
  profile: UserProfile | null;
  plans: WorkoutPlan[];
  history: WorkoutHistoryRecord[];
}

export interface LegacyTrainingStateResult extends LegacyTrainingState, PersistResult {
  currentPlanId?: string;
}

export interface LegacyTrainingMigrationResult extends PersistResult {
  profileMigrated: boolean;
  plansMigrated: number;
  historyMigrated: number;
  skipped: string[];
}

interface NormalizedLegacyTrainingState extends LegacyTrainingState {
  skipped: string[];
}

interface MockBackendState extends LegacyTrainingState {
  migrations: Array<LegacyTrainingMigrationResult & { createdAt: string }>;
}

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readJSON<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readMockBackendState(): MockBackendState {
  return readJSON<MockBackendState>(DEV_SYNC_KEY, {
    user: null,
    profile: null,
    plans: [],
    history: [],
    migrations: [],
  });
}

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function jsonLength(value: unknown): number {
  return JSON.stringify(value).length;
}

function assertJsonSize(value: unknown, maxLength: number, label: string): void {
  if (jsonLength(value) > maxLength) {
    throw new Error(`${label} excede o limite seguro de migracao.`);
  }
}

function boundedNumber(value: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeText(value: unknown, fallback: string, maxLength = 200): string {
  const sanitized = sanitizeText(String(value ?? '')).slice(0, maxLength);
  return sanitized || fallback;
}

function normalizeUser(user: User | null): User | null {
  if (!user) return null;

  return {
    ...jsonClone(user),
    name: normalizeText(user.name, 'Atleta', 160),
    email: normalizeText(user.email, '', 240).toLowerCase(),
    avatarUrl: user.avatarUrl ? sanitizeText(user.avatarUrl).slice(0, 1200) : undefined,
    profile: user.profile ? normalizeProfile(user.profile) : undefined,
  };
}

function normalizeProfile(profile: UserProfile | null): UserProfile | null {
  if (!profile) return null;

  const next = jsonClone(profile);
  const normalized: UserProfile = {
    ...next,
    id: next.id ? normalizeText(next.id, next.id, 120) : undefined,
    age: Math.round(boundedNumber(next.age, 18, 10, 100)),
    gender: normalizeText(next.gender, 'nao informado', 80),
    weight: boundedNumber(next.weight, 70, 20, 350),
    height: boundedNumber(next.height, 170, 80, 240),
    bodyFatPercent: next.bodyFatPercent === undefined ? undefined : boundedNumber(next.bodyFatPercent, 0, 3, 80),
    experienceLevel: normalizeText(next.experienceLevel, 'iniciante', 100),
    goal: normalizeText(next.goal, 'saude', 160),
    secondaryGoal: next.secondaryGoal ? normalizeText(next.secondaryGoal, '', 160) : undefined,
    daysPerWeek: Math.round(boundedNumber(next.daysPerWeek, 3, 1, 7)),
    sessionDuration: next.sessionDuration ? normalizeText(next.sessionDuration, '', 80) : undefined,
    preferredTime: next.preferredTime ? normalizeText(next.preferredTime, '', 40) : undefined,
    injuries: normalizeText(next.injuries, 'nenhuma', 1000),
    equipment: next.equipment ? normalizeText(next.equipment, '', 1000) : undefined,
    gymType: next.gymType ? normalizeText(next.gymType, '', 100) : undefined,
    sleepHours: next.sleepHours ? normalizeText(next.sleepHours, '', 80) : undefined,
    stressLevel: next.stressLevel ? normalizeText(next.stressLevel, '', 80) : undefined,
    preferredMethods: Array.isArray(next.preferredMethods)
      ? next.preferredMethods.slice(0, 20).map(item => normalizeText(item, '', 80)).filter(Boolean)
      : undefined,
    weakPoints: next.weakPoints ? normalizeText(next.weakPoints, '', 1000) : undefined,
    timePerWorkout: next.timePerWorkout === undefined ? undefined : Math.round(boundedNumber(next.timePerWorkout, 60, 10, 240)),
    workoutLocation: next.workoutLocation ? normalizeText(next.workoutLocation, '', 160) : undefined,
    secondaryFocus: next.secondaryFocus ? normalizeText(next.secondaryFocus, '', 160) : undefined,
  };

  assertJsonSize(normalized, MAX_PROFILE_JSON_LENGTH, 'Perfil');
  return normalized;
}

function normalizePlan(plan: WorkoutPlan, index: number): WorkoutPlan {
  const next = jsonClone(plan);
  if (!next.id) throw new Error(`Plano ${index + 1} sem id.`);
  if (!Array.isArray(next.days)) throw new Error(`Plano ${next.id} sem dias.`);

  const normalized: WorkoutPlan = {
    ...next,
    id: normalizeText(next.id, next.id, 120),
    createdAt: Math.round(boundedNumber(next.createdAt, Date.now(), 0)),
    planName: normalizeText(next.planName, 'Plano de treino', 200),
    goalDescription: normalizeText(next.goalDescription, '', 1000),
    days: next.days,
  };

  assertJsonSize(normalized, MAX_PLAN_JSON_LENGTH, `Plano ${normalized.id}`);
  return normalized;
}

function normalizeHistoryRecord(record: WorkoutHistoryRecord, index: number): WorkoutHistoryRecord {
  const next = jsonClone(record);
  if (!next.id) throw new Error(`Historico ${index + 1} sem id.`);
  if (!next.planId) throw new Error(`Historico ${next.id} sem planId.`);
  if (!next.dayId) throw new Error(`Historico ${next.id} sem dayId.`);

  const normalized: WorkoutHistoryRecord = {
    ...next,
    id: normalizeText(next.id, next.id, 120),
    date: Math.round(boundedNumber(next.date, Date.now(), 0)),
    planId: normalizeText(next.planId, next.planId, 120),
    dayId: normalizeText(next.dayId, next.dayId, 120),
    dayName: normalizeText(next.dayName, 'Treino', 200),
    focus: normalizeText(next.focus, '', 200),
    volumeLoad: boundedNumber(next.volumeLoad, 0, 0),
    durationMinutes: Math.round(boundedNumber(next.durationMinutes, 0, 0, 1440)),
    exercises: Array.isArray(next.exercises) ? next.exercises : [],
  };

  assertJsonSize(normalized, MAX_HISTORY_JSON_LENGTH, `Historico ${normalized.id}`);
  return normalized;
}

function collectValid<T, R>(
  values: T[],
  maxItems: number,
  normalize: (value: T, index: number) => R,
  label: string,
): { records: R[]; skipped: string[] } {
  const skipped: string[] = [];
  const records: R[] = [];

  values.slice(0, maxItems).forEach((value, index) => {
    try {
      records.push(normalize(value, index));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      skipped.push(`${label} ${index + 1}: ${message}`);
    }
  });

  if (values.length > maxItems) {
    skipped.push(`${label}: ${values.length - maxItems} itens excederam o limite de migracao.`);
  }

  return { records, skipped };
}

function normalizeLegacyState(state: LegacyTrainingState): NormalizedLegacyTrainingState {
  const profile = normalizeProfile(state.profile || state.user?.profile || null);
  const planResult = collectValid(state.plans || [], MAX_PLANS_TO_SYNC, normalizePlan, 'Plano');
  const historyResult = collectValid(state.history || [], MAX_HISTORY_TO_SYNC, normalizeHistoryRecord, 'Historico');

  return {
    user: normalizeUser(state.user),
    profile,
    plans: planResult.records,
    history: historyResult.records,
    skipped: [...planResult.skipped, ...historyResult.skipped],
  };
}

function mockResult(result: Omit<LegacyTrainingMigrationResult, 'dataMode' | 'warning'>): LegacyTrainingMigrationResult {
  return {
    ...result,
    dataMode: 'mock_dev_only',
    warning: DEV_WARNING,
  };
}

function assertNoError(error: SupabaseErrorLike, fallback: string): void {
  if (error) throw new Error(error.message || fallback);
}

async function getAuthUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.id) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

function persistMockState(
  state: NormalizedLegacyTrainingState,
  migration: LegacyTrainingMigrationResult,
): void {
  const current = readMockBackendState();
  writeJSON<MockBackendState>(DEV_SYNC_KEY, {
    user: state.user || current.user,
    profile: state.profile || current.profile,
    plans: state.plans.length ? state.plans : current.plans,
    history: state.history.length ? state.history : current.history,
    migrations: [{ ...migration, createdAt: new Date().toISOString() }, ...current.migrations].slice(0, 50),
  });
}

function mapProfileRow(row: Record<string, unknown> | null): UserProfile | null {
  if (!row?.profile_json || typeof row.profile_json !== 'object') return null;
  return row.profile_json as UserProfile;
}

function mapPlanRow(row: Record<string, unknown>): WorkoutPlan {
  return row.plan_json as WorkoutPlan;
}

function mapHistoryRow(row: Record<string, unknown>): WorkoutHistoryRecord {
  return row.record_json as WorkoutHistoryRecord;
}

export function loadLegacyTrainingStateFromLocalStorage(): LegacyTrainingState {
  const user = readJSON<User | null>(STORAGE_KEYS.user, null);
  const storedProfile = readJSON<UserProfile | null>(STORAGE_KEYS.profile, null);
  const plans = readJSON<WorkoutPlan[]>(STORAGE_KEYS.plans, []);
  const history = readJSON<WorkoutHistoryRecord[]>(STORAGE_KEYS.history, []);

  return normalizeLegacyState({
    user,
    profile: storedProfile || user?.profile || null,
    plans: Array.isArray(plans) ? plans : [],
    history: Array.isArray(history) ? history : [],
  });
}

export async function loadTrainingStateFromBackend(): Promise<LegacyTrainingStateResult> {
  const userId = await getAuthUserId();
  if (!userId) {
    const mock = readMockBackendState();
    const local = loadLegacyTrainingStateFromLocalStorage();
    return {
      dataMode: 'mock_dev_only',
      warning: DEV_WARNING,
      user: mock.user || local.user,
      profile: mock.profile || local.profile,
      plans: mock.plans.length ? mock.plans : local.plans,
      history: mock.history.length ? mock.history : local.history,
      currentPlanId: (mock.plans[0] || local.plans[0])?.id,
    };
  }

  const [profileResult, plansResult, historyResult] = await Promise.all([
    supabase
      .from('training_user_profiles')
      .select('profile_json')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('training_workout_plans')
      .select('id, plan_json, is_current, created_at_ms')
      .eq('user_id', userId)
      .order('is_current', { ascending: false })
      .order('created_at_ms', { ascending: false }),
    supabase
      .from('training_workout_history_records')
      .select('record_json, workout_date')
      .eq('user_id', userId)
      .order('workout_date', { ascending: false })
      .limit(MAX_HISTORY_TO_SYNC),
  ]);

  const error = profileResult.error || plansResult.error || historyResult.error;
  assertNoError(error, 'Falha ao carregar perfil/plano/historico no Supabase.');

  const planRows = (plansResult.data || []) as Array<Record<string, unknown>>;
  const plans = planRows.map(mapPlanRow);

  return {
    dataMode: 'supabase',
    user: null,
    profile: mapProfileRow(profileResult.data as Record<string, unknown> | null),
    plans,
    history: ((historyResult.data || []) as Array<Record<string, unknown>>).map(mapHistoryRow),
    currentPlanId: planRows.find(row => row.is_current === true)?.id as string | undefined || plans[0]?.id,
  };
}

export async function persistUserProfileToBackend(profile: UserProfile): Promise<PersistResult & { profile: UserProfile }> {
  const normalized = normalizeProfile(profile);
  if (!normalized) throw new Error('Perfil invalido para sincronizacao.');

  const userId = await getAuthUserId();
  if (!userId) {
    const state = normalizeLegacyState({ ...loadLegacyTrainingStateFromLocalStorage(), profile: normalized });
    const migration = mockResult({
      profileMigrated: true,
      plansMigrated: 0,
      historyMigrated: 0,
      skipped: state.skipped,
    });
    persistMockState(state, migration);
    return { dataMode: 'mock_dev_only', warning: DEV_WARNING, profile: normalized };
  }

  const { error } = await supabase.from('training_user_profiles').upsert({
    user_id: userId,
    profile_json: normalized,
    profile_goal: normalized.goal,
    profile_name: normalized.id || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  assertNoError(error, 'Falha ao salvar perfil no Supabase.');
  return { dataMode: 'supabase', profile: normalized };
}

export async function persistWorkoutPlansToBackend(
  plans: WorkoutPlan[],
  currentPlanId?: string | null,
): Promise<PersistResult & { plansMigrated: number; skipped: string[] }> {
  const normalized = normalizeLegacyState({
    user: null,
    profile: null,
    plans,
    history: [],
  });

  const userId = await getAuthUserId();
  if (!userId) {
    const state = normalizeLegacyState({ ...loadLegacyTrainingStateFromLocalStorage(), plans: normalized.plans });
    const migration = mockResult({
      profileMigrated: false,
      plansMigrated: normalized.plans.length,
      historyMigrated: 0,
      skipped: normalized.skipped,
    });
    persistMockState(state, migration);
    return {
      dataMode: 'mock_dev_only',
      warning: DEV_WARNING,
      plansMigrated: normalized.plans.length,
      skipped: normalized.skipped,
    };
  }

  if (normalized.plans.length) {
    const fallbackCurrentId = currentPlanId || normalized.plans[0]?.id;
    const rows = normalized.plans.map(plan => ({
      user_id: userId,
      id: plan.id,
      plan_name: plan.planName,
      goal_description: plan.goalDescription,
      created_at_ms: plan.createdAt,
      is_current: plan.id === fallbackCurrentId,
      plan_json: plan,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('training_workout_plans').upsert(rows, { onConflict: 'user_id,id' });
    assertNoError(error, 'Falha ao salvar planos no Supabase.');
  }

  return {
    dataMode: 'supabase',
    plansMigrated: normalized.plans.length,
    skipped: normalized.skipped,
  };
}

export async function persistWorkoutHistoryToBackend(
  history: WorkoutHistoryRecord[],
): Promise<PersistResult & { historyMigrated: number; skipped: string[] }> {
  const normalized = normalizeLegacyState({
    user: null,
    profile: null,
    plans: [],
    history,
  });

  const userId = await getAuthUserId();
  if (!userId) {
    const state = normalizeLegacyState({ ...loadLegacyTrainingStateFromLocalStorage(), history: normalized.history });
    const migration = mockResult({
      profileMigrated: false,
      plansMigrated: 0,
      historyMigrated: normalized.history.length,
      skipped: normalized.skipped,
    });
    persistMockState(state, migration);
    return {
      dataMode: 'mock_dev_only',
      warning: DEV_WARNING,
      historyMigrated: normalized.history.length,
      skipped: normalized.skipped,
    };
  }

  if (normalized.history.length) {
    const rows = normalized.history.map(record => ({
      user_id: userId,
      id: record.id,
      workout_date: new Date(record.date).toISOString(),
      plan_id: record.planId,
      day_id: record.dayId,
      day_name: record.dayName,
      focus: record.focus,
      volume_load: record.volumeLoad,
      duration_minutes: record.durationMinutes,
      record_json: record,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('training_workout_history_records').upsert(rows, { onConflict: 'user_id,id' });
    assertNoError(error, 'Falha ao salvar historico no Supabase.');
  }

  return {
    dataMode: 'supabase',
    historyMigrated: normalized.history.length,
    skipped: normalized.skipped,
  };
}

export async function migrateLegacyTrainingStateToBackend(
  input?: Partial<LegacyTrainingState>,
): Promise<LegacyTrainingMigrationResult> {
  const local = loadLegacyTrainingStateFromLocalStorage();
  const state = normalizeLegacyState({
    user: input?.user ?? local.user,
    profile: input?.profile ?? local.profile,
    plans: input?.plans ?? local.plans,
    history: input?.history ?? local.history,
  });

  const userId = await getAuthUserId();
  if (!userId) {
    const migration = mockResult({
      profileMigrated: Boolean(state.profile),
      plansMigrated: state.plans.length,
      historyMigrated: state.history.length,
      skipped: state.skipped,
    });
    persistMockState(state, migration);
    return migration;
  }

  if (state.profile) await persistUserProfileToBackend(state.profile);
  await persistWorkoutPlansToBackend(state.plans, state.plans[0]?.id);
  await persistWorkoutHistoryToBackend(state.history);

  const { error } = await supabase.from('legacy_training_migration_audits').insert({
    user_id: userId,
    source: 'local_storage',
    profile_migrated: Boolean(state.profile),
    plans_migrated: state.plans.length,
    history_migrated: state.history.length,
    skipped_count: state.skipped.length,
    warning: state.skipped.length ? state.skipped.slice(0, 5).join(' | ') : null,
  });

  assertNoError(error, 'Falha ao auditar migracao legado no Supabase.');

  return {
    dataMode: 'supabase',
    profileMigrated: Boolean(state.profile),
    plansMigrated: state.plans.length,
    historyMigrated: state.history.length,
    skipped: state.skipped,
  };
}

export function getLegacyTrainingSyncDataMode(): DataMode {
  return isSupabaseConfigured ? 'supabase' : 'mock_dev_only';
}
