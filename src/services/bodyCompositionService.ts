import { BodyMetric, BodyPhotoAngle, BodyProgressPhoto, RecompositionGoal } from '../types';
import { PersistResult } from '../types/trainingExecution';
import { sanitizeText } from '../utils/inputSanitizer';
import { logAuditEvent } from './auditLogService';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const BODY_PHOTOS_BUCKET = 'body-progress-photos';

const DEV_KEYS = {
  metrics: '@TreinoApp:bodyMetrics:mock_dev_only',
  photos: '@TreinoApp:bodyPhotos:mock_dev_only',
  goals: '@TreinoApp:recompositionGoals:mock_dev_only',
};

const LEGACY_BODY_KEY = '@TreinoApp:bodyMetrics';

export interface BodyCompositionState extends PersistResult {
  metrics: BodyMetric[];
  photos: BodyProgressPhoto[];
  goals: RecompositionGoal[];
}

export interface RecompositionProgress {
  goal: RecompositionGoal;
  percent: number;
  currentWeight?: number;
  currentBodyFatPercent?: number;
  currentWaist?: number;
  statusText: string;
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

function writeJSON<T>(key: string, value: T) {
  if (canUseStorage()) window.localStorage.setItem(key, JSON.stringify(value));
}

function readDevMetrics(): BodyMetric[] {
  const current = readJSON<BodyMetric[]>(DEV_KEYS.metrics, []);
  if (current.length) return current;
  return readJSON<BodyMetric[]>(LEGACY_BODY_KEY, []);
}

function devWarning() {
  return 'Supabase não configurado ou usuário não autenticado; composição corporal está em modo local de desenvolvimento.';
}

function devState(): BodyCompositionState {
  const metrics = readDevMetrics();
  const legacyPhotos = metrics
    .filter(metric => metric.photoBase64)
    .map(metric => ({
      id: metric.id,
      date: metric.date,
      monthKey: metric.date.slice(0, 7),
      angle: 'front' as const,
      mimeType: 'image/jpeg',
      photoBase64: metric.photoBase64,
      aiAnalysis: metric.aiAnalysis,
    }));

  return {
    dataMode: 'mock_dev_only',
    warning: devWarning(),
    metrics,
    photos: readJSON<BodyProgressPhoto[]>(DEV_KEYS.photos, legacyPhotos),
    goals: readJSON<RecompositionGoal[]>(DEV_KEYS.goals, []),
  };
}

async function getAuthUserId() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) return null;
  return data.user.id;
}

function numberOrUndefined(value: unknown, label: string, min: number, max: number) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) throw new Error(`${label} inválido.`);
  return Number(parsed.toFixed(1));
}

export function validateBodyMetricInput(input: Partial<BodyMetric>): BodyMetric {
  const metric: BodyMetric = {
    id: input.id || crypto.randomUUID(),
    date: input.date || new Date().toISOString().slice(0, 10),
    weight: numberOrUndefined(input.weight, 'Peso', 20, 350),
    bodyFatPercent: numberOrUndefined(input.bodyFatPercent, 'Percentual de gordura', 3, 80),
    chest: numberOrUndefined(input.chest, 'Peito', 20, 220),
    waist: numberOrUndefined(input.waist, 'Cintura', 20, 220),
    hip: numberOrUndefined(input.hip, 'Quadril', 20, 240),
    arm: numberOrUndefined(input.arm, 'Braço', 10, 100),
    thigh: numberOrUndefined(input.thigh, 'Coxa', 20, 140),
    photoBase64: input.photoBase64,
    aiAnalysis: input.aiAnalysis ? sanitizeText(input.aiAnalysis) : undefined,
  };

  const hasMeasurement = [metric.weight, metric.bodyFatPercent, metric.chest, metric.waist, metric.hip, metric.arm, metric.thigh]
    .some(value => value !== undefined);
  if (!hasMeasurement && !metric.photoBase64) throw new Error('Informe pelo menos uma medida corporal.');
  return metric;
}

export function validateRecompositionGoalInput(input: Partial<RecompositionGoal>, latest?: BodyMetric): RecompositionGoal {
  const title = sanitizeText(input.title || 'Meta de recomposição');
  if (title.length < 3) throw new Error('Informe um título para a meta.');
  if (!input.targetDate) throw new Error('Informe uma data-alvo para a meta.');

  const goal: RecompositionGoal = {
    id: input.id || crypto.randomUUID(),
    title,
    createdAt: input.createdAt || new Date().toISOString(),
    targetDate: input.targetDate,
    status: input.status || 'active',
    startWeight: numberOrUndefined(input.startWeight ?? latest?.weight, 'Peso inicial', 20, 350),
    targetWeight: numberOrUndefined(input.targetWeight, 'Peso-alvo', 20, 350),
    startBodyFatPercent: numberOrUndefined(input.startBodyFatPercent ?? latest?.bodyFatPercent, 'Gordura inicial', 3, 80),
    targetBodyFatPercent: numberOrUndefined(input.targetBodyFatPercent, 'Gordura-alvo', 3, 80),
    startWaist: numberOrUndefined(input.startWaist ?? latest?.waist, 'Cintura inicial', 20, 220),
    targetWaist: numberOrUndefined(input.targetWaist, 'Cintura-alvo', 20, 220),
    notes: input.notes ? sanitizeText(input.notes) : undefined,
  };

  if (!goal.targetWeight && !goal.targetBodyFatPercent && !goal.targetWaist) {
    throw new Error('Defina pelo menos um alvo: peso, gordura ou cintura.');
  }

  return goal;
}

function mapMetric(row: any): BodyMetric {
  return {
    id: row.id,
    date: row.metric_date,
    weight: row.weight ?? undefined,
    bodyFatPercent: row.body_fat_percent ?? undefined,
    chest: row.chest ?? undefined,
    waist: row.waist ?? undefined,
    hip: row.hip ?? undefined,
    arm: row.arm ?? undefined,
    thigh: row.thigh ?? undefined,
  };
}

function mapGoal(row: any): RecompositionGoal {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    targetDate: row.target_date,
    status: row.status,
    startWeight: row.start_weight ?? undefined,
    targetWeight: row.target_weight ?? undefined,
    startBodyFatPercent: row.start_body_fat_percent ?? undefined,
    targetBodyFatPercent: row.target_body_fat_percent ?? undefined,
    startWaist: row.start_waist ?? undefined,
    targetWaist: row.target_waist ?? undefined,
    notes: row.notes ?? undefined,
  };
}

async function signedPhotoUrl(storagePath?: string) {
  if (!storagePath) return undefined;
  const { data, error } = await supabase.storage.from(BODY_PHOTOS_BUCKET).createSignedUrl(storagePath, 60 * 60);
  if (error) return undefined;
  return data.signedUrl;
}

async function mapPhoto(row: any): Promise<BodyProgressPhoto> {
  return {
    id: row.id,
    date: row.photo_date,
    monthKey: row.month_key,
    angle: row.angle,
    mimeType: row.mime_type,
    storagePath: row.storage_path,
    photoUrl: await signedPhotoUrl(row.storage_path),
    aiAnalysis: row.ai_analysis ?? undefined,
  };
}

export async function loadBodyCompositionState(): Promise<BodyCompositionState> {
  const userId = await getAuthUserId();
  if (!userId) return devState();

  const [metricsResult, photosResult, goalsResult] = await Promise.all([
    supabase.from('body_metrics').select('*').eq('user_id', userId).order('metric_date', { ascending: true }),
    supabase.from('body_progress_photos').select('*').eq('user_id', userId).order('photo_date', { ascending: true }),
    supabase.from('body_recomposition_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  const error = metricsResult.error || photosResult.error || goalsResult.error;
  if (error) throw new Error(`Falha ao carregar composição corporal: ${error.message}`);

  return {
    dataMode: 'supabase',
    metrics: (metricsResult.data || []).map(mapMetric),
    photos: await Promise.all((photosResult.data || []).map(mapPhoto)),
    goals: (goalsResult.data || []).map(mapGoal),
  };
}

export async function saveBodyMetric(input: Partial<BodyMetric>): Promise<PersistResult & { metric: BodyMetric }> {
  const metric = validateBodyMetricInput(input);
  const userId = await getAuthUserId();

  if (!userId) {
    const state = devState();
    writeJSON(DEV_KEYS.metrics, [...state.metrics.filter(item => item.id !== metric.id), metric]);
    return { dataMode: 'mock_dev_only', metric, warning: devWarning() };
  }

  const { error } = await supabase.from('body_metrics').upsert({
    id: metric.id,
    user_id: userId,
    metric_date: metric.date,
    weight: metric.weight,
    body_fat_percent: metric.bodyFatPercent,
    chest: metric.chest,
    waist: metric.waist,
    hip: metric.hip,
    arm: metric.arm,
    thigh: metric.thigh,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(`Falha ao salvar medidas: ${error.message}`);
  logAuditEvent('body.metric.upsert', 'Medição corporal registrada.', userId);
  return { dataMode: 'supabase', metric };
}

function base64ToBlob(base64: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

function extensionForMime(mimeType: string) {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  return 'jpg';
}

export async function saveProgressPhoto(input: {
  base64: string;
  mimeType: string;
  angle?: BodyPhotoAngle;
  date?: string;
  aiAnalysis?: string;
}): Promise<PersistResult & { photo: BodyProgressPhoto }> {
  if (!input.base64) throw new Error('Foto inválida.');
  if (!input.mimeType.startsWith('image/')) throw new Error('Envie um arquivo de imagem.');

  const id = crypto.randomUUID();
  const date = input.date || new Date().toISOString().slice(0, 10);
  const monthKey = date.slice(0, 7);
  const photo: BodyProgressPhoto = {
    id,
    date,
    monthKey,
    angle: input.angle || 'front',
    mimeType: input.mimeType,
    photoBase64: input.base64,
    aiAnalysis: input.aiAnalysis ? sanitizeText(input.aiAnalysis) : undefined,
  };
  const userId = await getAuthUserId();

  if (!userId) {
    const state = devState();
    writeJSON(DEV_KEYS.photos, [...state.photos, photo]);
    return { dataMode: 'mock_dev_only', photo, warning: devWarning() };
  }

  const storagePath = `${userId}/${monthKey}/${id}.${extensionForMime(input.mimeType)}`;
  const { error: uploadError } = await supabase.storage
    .from(BODY_PHOTOS_BUCKET)
    .upload(storagePath, base64ToBlob(input.base64, input.mimeType), {
      contentType: input.mimeType,
      upsert: false,
    });

  if (uploadError) throw new Error(`Falha ao enviar foto: ${uploadError.message}`);

  const { error } = await supabase.from('body_progress_photos').insert({
    id,
    user_id: userId,
    photo_date: date,
    month_key: monthKey,
    angle: photo.angle,
    mime_type: input.mimeType,
    storage_path: storagePath,
    ai_analysis: photo.aiAnalysis,
  });

  if (error) throw new Error(`Falha ao registrar foto: ${error.message}`);
  logAuditEvent('body.photo.insert', 'Foto de progresso corporal registrada.', userId);
  return {
    dataMode: 'supabase',
    photo: {
      ...photo,
      photoBase64: undefined,
      storagePath,
      photoUrl: await signedPhotoUrl(storagePath),
    },
  };
}

export async function saveRecompositionGoal(
  input: Partial<RecompositionGoal>,
  latest?: BodyMetric,
): Promise<PersistResult & { goal: RecompositionGoal }> {
  const goal = validateRecompositionGoalInput(input, latest);
  const userId = await getAuthUserId();

  if (!userId) {
    const state = devState();
    writeJSON(DEV_KEYS.goals, [goal, ...state.goals.filter(item => item.id !== goal.id)]);
    return { dataMode: 'mock_dev_only', goal, warning: devWarning() };
  }

  const { error } = await supabase.from('body_recomposition_goals').upsert({
    id: goal.id,
    user_id: userId,
    title: goal.title,
    target_date: goal.targetDate,
    status: goal.status,
    start_weight: goal.startWeight,
    target_weight: goal.targetWeight,
    start_body_fat_percent: goal.startBodyFatPercent,
    target_body_fat_percent: goal.targetBodyFatPercent,
    start_waist: goal.startWaist,
    target_waist: goal.targetWaist,
    notes: goal.notes,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(`Falha ao salvar meta: ${error.message}`);
  logAuditEvent('body.goal.upsert', `Meta de recomposição atualizada: ${goal.title}.`, userId);
  return { dataMode: 'supabase', goal };
}

function progressForMetric(start?: number, target?: number, current?: number) {
  if (start === undefined || target === undefined || current === undefined || start === target) return undefined;
  const total = target - start;
  const done = current - start;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

export function calculateRecompositionProgress(metrics: BodyMetric[], goals: RecompositionGoal[]): RecompositionProgress[] {
  const latest = [...metrics]
    .filter(metric => metric.weight || metric.bodyFatPercent || metric.waist)
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1);

  return goals.map(goal => {
    const values = [
      progressForMetric(goal.startWeight, goal.targetWeight, latest?.weight),
      progressForMetric(goal.startBodyFatPercent, goal.targetBodyFatPercent, latest?.bodyFatPercent),
      progressForMetric(goal.startWaist, goal.targetWaist, latest?.waist),
    ].filter((value): value is number => value !== undefined);
    const percent = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

    return {
      goal,
      percent,
      currentWeight: latest?.weight,
      currentBodyFatPercent: latest?.bodyFatPercent,
      currentWaist: latest?.waist,
      statusText: values.length
        ? `${percent}% da meta com base na última medição.`
        : 'Registre medidas para acompanhar a meta.',
    };
  });
}

export function photoSrc(photo: BodyProgressPhoto) {
  return photo.photoUrl || (photo.photoBase64 ? `data:${photo.mimeType};base64,${photo.photoBase64}` : '');
}
