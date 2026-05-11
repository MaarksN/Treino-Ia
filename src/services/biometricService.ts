import { isSupabaseConfigured, supabase } from './supabaseClient';
import {
  BiometricPersistenceMeta,
  BiometricQueryResult,
  BiometricSnapshot,
  CycleEntry,
  HeartRateReading,
  HRZones,
  HydrationEntry,
  HydrationGoal,
  PoseAnalysis,
  SleepEntry,
  WearableSession,
} from '../types';

const LOCAL_KEYS = {
  wearable: '@TreinoApp:biometrics:mock_dev_only:wearableSessions',
  hydration: '@TreinoApp:hydration:mock_dev_only',
  hydrationGoal: '@TreinoApp:hydrationGoal:mock_dev_only',
  sleep: '@TreinoApp:sleep:mock_dev_only',
  cycles: '@TreinoApp:biometrics:mock_dev_only:hormonalCycle',
  pose: '@TreinoApp:biometrics:mock_dev_only:poseAnalyses',
} as const;

const LEGACY_LOCAL_KEYS = {
  hydration: '@TreinoApp:hydration',
  hydrationGoal: '@TreinoApp:hydrationGoal',
  sleep: '@TreinoApp:sleep',
} as const;

const MOCK_NOT_CONFIGURED_REASON = 'Supabase nao configurado; dados locais apenas para desenvolvimento.';
const MOCK_NO_AUTH_REASON = 'Usuario Supabase nao autenticado; dados locais apenas para desenvolvimento.';
const DEFAULT_HYDRATION_GOAL: HydrationGoal = { dailyMl: 2500, remindEveryMinutes: 60 };
const HYDRATION_TYPES: HydrationEntry['type'][] = ['água', 'isotônico', 'whey', 'café', 'outro'];

type PersistenceContext =
  | { dataMode: 'supabase'; userId: string }
  | { dataMode: 'mock_dev_only'; reason: string };

type SupabaseErrorLike = { message?: string; details?: string; hint?: string; code?: string };

interface WearableSessionRow {
  id: string;
  started_at: string;
  ended_at: string | null;
  avg_hr: number;
  max_hr: number;
  min_hr: number;
  readings: HeartRateReading[] | null;
  device_name: string;
  calories: number | null;
  hr_zones: HRZones | null;
}

interface HydrationEntryRow {
  id: string;
  date: string;
  time: string;
  amount_ml: number;
  type: HydrationEntry['type'];
}

interface HydrationGoalRow {
  daily_ml: number;
  remind_every_minutes: number | null;
}

interface SleepEntryRow {
  id: string;
  date: string;
  bedtime: string;
  wake_time: string;
  duration_minutes: number;
  quality: SleepEntry['quality'];
  notes: string | null;
  deep_sleep_pct: number | null;
  rem_sleep_pct: number | null;
}

interface CycleEntryRow {
  id: string;
  start_date: string;
  cycle_length_days: number;
  period_length_days: number;
}

interface PoseAnalysisRow {
  id: string;
  exercise_name: string;
  analyzed_on: string;
  rep_count: number;
  form_score: number;
  issues: string[] | null;
  tips: string[] | null;
  key_angles: Record<string, number> | null;
}

function assertNoError(error: SupabaseErrorLike | null | undefined): void {
  if (error) {
    throw new Error(error.message || JSON.stringify(error));
  }
}

function buildMeta(context: PersistenceContext): BiometricPersistenceMeta {
  return {
    dataMode: context.dataMode,
    reason: context.dataMode === 'mock_dev_only' ? context.reason : undefined,
    syncedAt: new Date().toISOString(),
  };
}

async function getPersistenceContext(): Promise<PersistenceContext> {
  if (!isSupabaseConfigured) {
    return { dataMode: 'mock_dev_only', reason: MOCK_NOT_CONFIGURED_REASON };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    return { dataMode: 'mock_dev_only', reason: MOCK_NO_AUTH_REASON };
  }

  return { dataMode: 'supabase', userId: data.user.id };
}

function readLocalArray<T>(key: string, legacyKey?: string): T[] {
  if (typeof localStorage === 'undefined') return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(parsed) && parsed.length) return parsed;

    if (legacyKey) {
      const legacyParsed = JSON.parse(localStorage.getItem(legacyKey) || '[]');
      return Array.isArray(legacyParsed) ? legacyParsed : [];
    }

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalArray<T>(key: string, values: T[], maxItems: number): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(values.slice(-maxItems)));
}

function readLocalObject<T>(key: string, fallback: T, legacyKey?: string): T {
  if (typeof localStorage === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(key) || (legacyKey ? localStorage.getItem(legacyKey) : null);
    return { ...fallback, ...JSON.parse(raw || '{}') };
  } catch {
    return fallback;
  }
}

function writeLocalObject<T>(key: string, value: T): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function assertIsoDate(value: string, field: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${field} invalido.`);
  }
}

function assertTime(value: string, field: string): void {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    throw new Error(`${field} invalido.`);
  }

  const [hours, minutes] = value.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`${field} invalido.`);
  }
}

function assertFiniteNumber(value: number, field: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${field} invalido.`);
  }
}

function normalizeTime(value: string): string {
  return value.slice(0, 5);
}

export function validateHydrationEntry(entry: HydrationEntry): HydrationEntry {
  assertIsoDate(entry.date, 'Data da hidratacao');
  assertTime(entry.time, 'Horario da hidratacao');
  assertFiniteNumber(entry.amountMl, 'Volume');

  if (entry.amountMl <= 0 || entry.amountMl > 3000) {
    throw new Error('Volume de hidratacao deve estar entre 1ml e 3000ml.');
  }

  if (!HYDRATION_TYPES.includes(entry.type)) {
    throw new Error('Tipo de bebida invalido.');
  }

  return {
    ...entry,
    amountMl: Math.round(entry.amountMl),
    time: normalizeTime(entry.time),
  };
}

export function validateHydrationGoal(goal: HydrationGoal): HydrationGoal {
  assertFiniteNumber(goal.dailyMl, 'Meta de hidratacao');
  if (goal.dailyMl < 250 || goal.dailyMl > 8000) {
    throw new Error('Meta diaria deve estar entre 250ml e 8000ml.');
  }

  if (
    goal.remindEveryMinutes !== undefined &&
    goal.remindEveryMinutes !== null &&
    goal.remindEveryMinutes !== 0 &&
    (goal.remindEveryMinutes < 15 || goal.remindEveryMinutes > 360)
  ) {
    throw new Error('Lembrete deve ficar entre 15 e 360 minutos.');
  }

  return {
    dailyMl: Math.round(goal.dailyMl),
    remindEveryMinutes: goal.remindEveryMinutes ? Math.round(goal.remindEveryMinutes) : 0,
  };
}

export function validateSleepEntry(entry: SleepEntry): SleepEntry {
  assertIsoDate(entry.date, 'Data do sono');
  assertTime(entry.bedtime, 'Horario de dormir');
  assertTime(entry.wakeTime, 'Horario de acordar');
  assertFiniteNumber(entry.durationMinutes, 'Duracao do sono');

  if (entry.durationMinutes <= 0 || entry.durationMinutes > 960) {
    throw new Error('Duracao de sono invalida.');
  }

  if (![1, 2, 3, 4, 5].includes(entry.quality)) {
    throw new Error('Qualidade do sono invalida.');
  }

  return {
    ...entry,
    bedtime: normalizeTime(entry.bedtime),
    wakeTime: normalizeTime(entry.wakeTime),
    notes: entry.notes?.trim().slice(0, 500) || undefined,
  };
}

export function validateCycleEntry(entry: CycleEntry): CycleEntry {
  assertIsoDate(entry.startDate, 'Inicio do ciclo');

  if (entry.cycleLengthDays < 21 || entry.cycleLengthDays > 45) {
    throw new Error('Duracao do ciclo deve ficar entre 21 e 45 dias.');
  }

  if (entry.periodLengthDays < 1 || entry.periodLengthDays > 14) {
    throw new Error('Periodo menstrual deve ficar entre 1 e 14 dias.');
  }

  if (entry.periodLengthDays >= entry.cycleLengthDays) {
    throw new Error('Periodo menstrual deve ser menor que o ciclo.');
  }

  return {
    ...entry,
    cycleLengthDays: Math.round(entry.cycleLengthDays),
    periodLengthDays: Math.round(entry.periodLengthDays),
  };
}

export function validateWearableSession(session: WearableSession): WearableSession {
  if (!session.startedAt || session.startedAt > Date.now() + 60_000) {
    throw new Error('Inicio da sessao invalido.');
  }

  if (session.endedAt && session.endedAt < session.startedAt) {
    throw new Error('Fim da sessao invalido.');
  }

  const readings = session.readings.filter(reading => {
    return (
      Number.isFinite(reading.bpm) &&
      reading.bpm >= 30 &&
      reading.bpm <= 240 &&
      Number.isFinite(reading.timestamp)
    );
  });

  if (!readings.length) {
    throw new Error('Sessao sem leituras validas de BPM.');
  }

  return {
    ...session,
    deviceName: session.deviceName.trim().slice(0, 120) || 'Monitor de FC',
    avgHR: Math.round(session.avgHR),
    maxHR: Math.round(session.maxHR),
    minHR: Math.round(session.minHR),
    calories: session.calories ? Math.max(0, Math.round(session.calories)) : undefined,
    readings,
  };
}

export function validatePoseAnalysis(analysis: PoseAnalysis): PoseAnalysis {
  assertIsoDate(analysis.date, 'Data da analise');

  if (!analysis.exerciseName.trim()) {
    throw new Error('Exercicio da analise obrigatorio.');
  }

  if (analysis.repCount < 0 || analysis.repCount > 1000) {
    throw new Error('Contagem de repeticoes invalida.');
  }

  if (analysis.formScore < 0 || analysis.formScore > 100) {
    throw new Error('Score de forma invalido.');
  }

  return {
    ...analysis,
    exerciseName: analysis.exerciseName.trim().slice(0, 120),
    repCount: Math.round(analysis.repCount),
    formScore: Math.round(analysis.formScore),
    issues: analysis.issues.map(issue => issue.trim()).filter(Boolean).slice(0, 10),
    tips: analysis.tips.map(tip => tip.trim()).filter(Boolean).slice(0, 10),
    thumbnail: undefined,
  };
}

function mapWearableRow(row: WearableSessionRow): WearableSession {
  return {
    id: row.id,
    startedAt: new Date(row.started_at).getTime(),
    endedAt: row.ended_at ? new Date(row.ended_at).getTime() : undefined,
    avgHR: row.avg_hr,
    maxHR: row.max_hr,
    minHR: row.min_hr,
    readings: row.readings ?? [],
    deviceName: row.device_name,
    calories: row.calories ?? undefined,
    hrZones: row.hr_zones ?? { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 },
  };
}

function mapHydrationRow(row: HydrationEntryRow): HydrationEntry {
  return {
    id: row.id,
    date: row.date,
    time: normalizeTime(row.time),
    amountMl: row.amount_ml,
    type: row.type,
  };
}

function mapSleepRow(row: SleepEntryRow): SleepEntry {
  return {
    id: row.id,
    date: row.date,
    bedtime: normalizeTime(row.bedtime),
    wakeTime: normalizeTime(row.wake_time),
    durationMinutes: row.duration_minutes,
    quality: row.quality,
    notes: row.notes ?? undefined,
    deepSleepPct: row.deep_sleep_pct ?? undefined,
    remSleepPct: row.rem_sleep_pct ?? undefined,
  };
}

function mapCycleRow(row: CycleEntryRow): CycleEntry {
  return {
    id: row.id,
    startDate: row.start_date,
    cycleLengthDays: row.cycle_length_days,
    periodLengthDays: row.period_length_days,
  };
}

function mapPoseRow(row: PoseAnalysisRow): PoseAnalysis {
  return {
    id: row.id,
    exerciseName: row.exercise_name,
    date: row.analyzed_on,
    repCount: row.rep_count,
    formScore: row.form_score,
    issues: row.issues ?? [],
    tips: row.tips ?? [],
    keyAngles: row.key_angles ?? {},
  };
}

async function loadSupabaseSnapshot(): Promise<BiometricSnapshot> {
  const [
    wearableResponse,
    hydrationResponse,
    goalResponse,
    sleepResponse,
    cycleResponse,
    poseResponse,
  ] = await Promise.all([
    supabase
      .from('biometric_wearable_sessions')
      .select('id, started_at, ended_at, avg_hr, max_hr, min_hr, readings, device_name, calories, hr_zones')
      .order('started_at', { ascending: true })
      .limit(50),
    supabase
      .from('hydration_entries')
      .select('id, date, time, amount_ml, type')
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(300),
    supabase
      .from('hydration_goals')
      .select('daily_ml, remind_every_minutes')
      .maybeSingle(),
    supabase
      .from('sleep_entries')
      .select('id, date, bedtime, wake_time, duration_minutes, quality, notes, deep_sleep_pct, rem_sleep_pct')
      .order('date', { ascending: true })
      .limit(120),
    supabase
      .from('biometric_hormonal_cycles')
      .select('id, start_date, cycle_length_days, period_length_days')
      .order('start_date', { ascending: true })
      .limit(24),
    supabase
      .from('biometric_pose_analyses')
      .select('id, exercise_name, analyzed_on, rep_count, form_score, issues, tips, key_angles')
      .order('created_at', { ascending: true })
      .limit(50),
  ]);

  assertNoError(wearableResponse.error);
  assertNoError(hydrationResponse.error);
  assertNoError(goalResponse.error);
  assertNoError(sleepResponse.error);
  assertNoError(cycleResponse.error);
  assertNoError(poseResponse.error);

  const goal = goalResponse.data as HydrationGoalRow | null;

  return {
    wearableSessions: ((wearableResponse.data ?? []) as WearableSessionRow[]).map(mapWearableRow),
    hydrationEntries: ((hydrationResponse.data ?? []) as HydrationEntryRow[]).map(mapHydrationRow),
    hydrationGoal: goal
      ? {
          dailyMl: goal.daily_ml,
          remindEveryMinutes: goal.remind_every_minutes ?? 0,
        }
      : DEFAULT_HYDRATION_GOAL,
    sleepEntries: ((sleepResponse.data ?? []) as SleepEntryRow[]).map(mapSleepRow),
    cycleEntries: ((cycleResponse.data ?? []) as CycleEntryRow[]).map(mapCycleRow),
    poseAnalyses: ((poseResponse.data ?? []) as PoseAnalysisRow[]).map(mapPoseRow),
  };
}

function loadLocalSnapshot(): BiometricSnapshot {
  return {
    wearableSessions: readLocalArray<WearableSession>(LOCAL_KEYS.wearable),
    hydrationEntries: readLocalArray<HydrationEntry>(LOCAL_KEYS.hydration, LEGACY_LOCAL_KEYS.hydration),
    hydrationGoal: readLocalObject<HydrationGoal>(LOCAL_KEYS.hydrationGoal, DEFAULT_HYDRATION_GOAL, LEGACY_LOCAL_KEYS.hydrationGoal),
    sleepEntries: readLocalArray<SleepEntry>(LOCAL_KEYS.sleep, LEGACY_LOCAL_KEYS.sleep),
    cycleEntries: readLocalArray<CycleEntry>(LOCAL_KEYS.cycles),
    poseAnalyses: readLocalArray<PoseAnalysis>(LOCAL_KEYS.pose),
  };
}

export async function loadBiometricSnapshot(): Promise<BiometricQueryResult<BiometricSnapshot>> {
  const context = await getPersistenceContext();
  const data = context.dataMode === 'supabase' ? await loadSupabaseSnapshot() : loadLocalSnapshot();
  return { data, meta: buildMeta(context) };
}

export async function loadWearableSessions(): Promise<BiometricQueryResult<WearableSession[]>> {
  const result = await loadBiometricSnapshot();
  return { data: result.data.wearableSessions, meta: result.meta };
}

export async function saveWearableSession(sessionInput: WearableSession): Promise<BiometricQueryResult<WearableSession[]>> {
  const session = validateWearableSession(sessionInput);
  const context = await getPersistenceContext();

  if (context.dataMode === 'mock_dev_only') {
    const sessions = [...readLocalArray<WearableSession>(LOCAL_KEYS.wearable), session].slice(-50);
    writeLocalArray(LOCAL_KEYS.wearable, sessions, 50);
    return { data: sessions, meta: buildMeta(context) };
  }

  const { error } = await supabase.from('biometric_wearable_sessions').insert({
    id: session.id,
    user_id: context.userId,
    started_at: new Date(session.startedAt).toISOString(),
    ended_at: session.endedAt ? new Date(session.endedAt).toISOString() : null,
    avg_hr: session.avgHR,
    max_hr: session.maxHR,
    min_hr: session.minHR,
    readings: session.readings,
    device_name: session.deviceName,
    calories: session.calories ?? null,
    hr_zones: session.hrZones,
  });
  assertNoError(error);

  return loadWearableSessions();
}

export async function loadHydrationState(): Promise<BiometricQueryResult<{
  entries: HydrationEntry[];
  goal: HydrationGoal;
}>> {
  const result = await loadBiometricSnapshot();
  return {
    data: {
      entries: result.data.hydrationEntries,
      goal: result.data.hydrationGoal,
    },
    meta: result.meta,
  };
}

export async function saveHydrationEntry(entryInput: HydrationEntry): Promise<BiometricQueryResult<HydrationEntry[]>> {
  const entry = validateHydrationEntry(entryInput);
  const context = await getPersistenceContext();

  if (context.dataMode === 'mock_dev_only') {
    const entries = [...readLocalArray<HydrationEntry>(LOCAL_KEYS.hydration), entry].slice(-300);
    writeLocalArray(LOCAL_KEYS.hydration, entries, 300);
    return { data: entries, meta: buildMeta(context) };
  }

  const { error } = await supabase.from('hydration_entries').insert({
    id: entry.id,
    user_id: context.userId,
    date: entry.date,
    time: entry.time,
    amount_ml: entry.amountMl,
    type: entry.type,
  });
  assertNoError(error);

  const state = await loadHydrationState();
  return { data: state.data.entries, meta: state.meta };
}

export async function saveHydrationGoal(goalInput: HydrationGoal): Promise<BiometricQueryResult<HydrationGoal>> {
  const goal = validateHydrationGoal(goalInput);
  const context = await getPersistenceContext();

  if (context.dataMode === 'mock_dev_only') {
    writeLocalObject(LOCAL_KEYS.hydrationGoal, goal);
    return { data: goal, meta: buildMeta(context) };
  }

  const { error } = await supabase.from('hydration_goals').upsert({
    user_id: context.userId,
    daily_ml: goal.dailyMl,
    remind_every_minutes: goal.remindEveryMinutes,
    updated_at: new Date().toISOString(),
  });
  assertNoError(error);

  return { data: goal, meta: buildMeta(context) };
}

export async function loadSleepEntries(): Promise<BiometricQueryResult<SleepEntry[]>> {
  const result = await loadBiometricSnapshot();
  return { data: result.data.sleepEntries, meta: result.meta };
}

export async function saveSleepEntry(entryInput: SleepEntry): Promise<BiometricQueryResult<SleepEntry[]>> {
  const entry = validateSleepEntry(entryInput);
  const context = await getPersistenceContext();

  if (context.dataMode === 'mock_dev_only') {
    const entries = readLocalArray<SleepEntry>(LOCAL_KEYS.sleep);
    const existing = entries.findIndex(item => item.date === entry.date);
    if (existing >= 0) entries[existing] = entry;
    else entries.push(entry);
    writeLocalArray(LOCAL_KEYS.sleep, entries, 120);
    return { data: entries, meta: buildMeta(context) };
  }

  const { error } = await supabase.from('sleep_entries').upsert(
    {
      id: entry.id,
      user_id: context.userId,
      date: entry.date,
      bedtime: entry.bedtime,
      wake_time: entry.wakeTime,
      duration_minutes: entry.durationMinutes,
      quality: entry.quality,
      notes: entry.notes ?? null,
      deep_sleep_pct: entry.deepSleepPct ?? null,
      rem_sleep_pct: entry.remSleepPct ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,date' },
  );
  assertNoError(error);

  return loadSleepEntries();
}

export async function loadCycleEntries(): Promise<BiometricQueryResult<CycleEntry[]>> {
  const result = await loadBiometricSnapshot();
  return { data: result.data.cycleEntries, meta: result.meta };
}

export async function saveCycleEntry(entryInput: CycleEntry): Promise<BiometricQueryResult<CycleEntry[]>> {
  const entry = validateCycleEntry(entryInput);
  const context = await getPersistenceContext();

  if (context.dataMode === 'mock_dev_only') {
    const entries = [...readLocalArray<CycleEntry>(LOCAL_KEYS.cycles), entry].slice(-24);
    writeLocalArray(LOCAL_KEYS.cycles, entries, 24);
    return { data: entries, meta: buildMeta(context) };
  }

  const { error } = await supabase.from('biometric_hormonal_cycles').insert({
    id: entry.id,
    user_id: context.userId,
    start_date: entry.startDate,
    cycle_length_days: entry.cycleLengthDays,
    period_length_days: entry.periodLengthDays,
  });
  assertNoError(error);

  return loadCycleEntries();
}

export async function loadPoseAnalyses(): Promise<BiometricQueryResult<PoseAnalysis[]>> {
  const result = await loadBiometricSnapshot();
  return { data: result.data.poseAnalyses, meta: result.meta };
}

export async function savePoseAnalysis(analysisInput: PoseAnalysis): Promise<BiometricQueryResult<PoseAnalysis[]>> {
  const analysis = validatePoseAnalysis(analysisInput);
  const context = await getPersistenceContext();

  if (context.dataMode === 'mock_dev_only') {
    const entries = [...readLocalArray<PoseAnalysis>(LOCAL_KEYS.pose), analysis].slice(-50);
    writeLocalArray(LOCAL_KEYS.pose, entries, 50);
    return { data: entries, meta: buildMeta(context) };
  }

  const { error } = await supabase.from('biometric_pose_analyses').insert({
    id: analysis.id,
    user_id: context.userId,
    exercise_name: analysis.exerciseName,
    analyzed_on: analysis.date,
    rep_count: analysis.repCount,
    form_score: analysis.formScore,
    issues: analysis.issues,
    tips: analysis.tips,
    key_angles: analysis.keyAngles,
  });
  assertNoError(error);

  return loadPoseAnalyses();
}
