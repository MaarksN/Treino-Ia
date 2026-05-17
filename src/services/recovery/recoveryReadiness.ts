import { type WorkoutSession } from '../database';

const DAY_MS = 24 * 60 * 60 * 1000;

export const PAIN_REGION_DEFINITIONS = [
  { key: 'neck', label: 'Pescoco', group: 'superior' },
  { key: 'shoulders', label: 'Ombros', group: 'superior' },
  { key: 'elbowsWrists', label: 'Cotovelos/punhos', group: 'superior' },
  { key: 'upperBack', label: 'Costas altas', group: 'tronco' },
  { key: 'lowerBack', label: 'Lombar', group: 'tronco' },
  { key: 'hips', label: 'Quadril', group: 'inferior' },
  { key: 'knees', label: 'Joelhos', group: 'inferior' },
  { key: 'anklesFeet', label: 'Tornozelos/pes', group: 'inferior' },
] as const;

export const CAFFEINE_PRESETS = [
  { label: 'Cafe coado', amountMg: 80 },
  { label: 'Espresso duplo', amountMg: 120 },
  { label: 'Energetico', amountMg: 160 },
  { label: 'Pre-treino', amountMg: 200 },
] as const;

export type PainRegionKey = typeof PAIN_REGION_DEFINITIONS[number]['key'];
export type PainRegionMap = Record<PainRegionKey, number>;

export interface PainCheckin {
  date: string;
  regions: PainRegionMap;
  notes: string;
  updatedAt: number;
}

export interface PainSummary {
  average: number;
  max: number;
  activeRegions: Array<{ key: PainRegionKey; label: string; intensity: number }>;
  status: 'clear' | 'low' | 'moderate' | 'high';
  label: string;
  message: string;
}

export interface CaffeineEntry {
  id: string;
  date: string;
  consumedAt: string;
  label: string;
  amountMg: number;
  createdAt: number;
}

export interface CaffeineSummary {
  date: string;
  count: number;
  totalMg: number;
  lateMg: number;
  level: 'none' | 'low' | 'moderate' | 'high';
  label: string;
  message: string;
}

export interface RpeLoadSummary {
  windowDays: number;
  sessionCount: number;
  totalLoad: number;
  averageSessionRpe: number;
  level: 'none' | 'light' | 'moderate' | 'high' | 'very_high';
  label: string;
  message: string;
}

export interface RecoveryModeRecommendation {
  mode: 'insufficient_data' | 'train' | 'adjusted_training' | 'active_recovery' | 'day_off';
  label: string;
  message: string;
  reasons: string[];
}

export function getDateKey(timestamp = Date.now()): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function createEmptyPainMap(): PainRegionMap {
  return PAIN_REGION_DEFINITIONS.reduce((map, region) => {
    map[region.key] = 0;
    return map;
  }, {} as PainRegionMap);
}

export function createPainCheckin(date = getDateKey()): PainCheckin {
  return {
    date,
    regions: createEmptyPainMap(),
    notes: '',
    updatedAt: Date.now(),
  };
}

export function clampScale(value: unknown, min = 0, max = 10): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function normalizePainCheckin(checkin: Partial<PainCheckin> | null | undefined): PainCheckin {
  const base = createPainCheckin(checkin?.date || getDateKey());
  const regions = createEmptyPainMap();

  for (const region of PAIN_REGION_DEFINITIONS) {
    regions[region.key] = clampScale(checkin?.regions?.[region.key]);
  }

  return {
    ...base,
    date: checkin?.date || base.date,
    regions,
    notes: typeof checkin?.notes === 'string' ? checkin.notes.slice(0, 240) : '',
    updatedAt: Number.isFinite(checkin?.updatedAt) ? Number(checkin?.updatedAt) : base.updatedAt,
  };
}

export function summarizePainCheckin(checkin: PainCheckin | null | undefined): PainSummary {
  const normalized = normalizePainCheckin(checkin);
  const values = PAIN_REGION_DEFINITIONS.map(region => normalized.regions[region.key]);
  const average = values.length
    ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
    : 0;
  const max = values.length ? Math.max(...values) : 0;
  const activeRegions = PAIN_REGION_DEFINITIONS
    .map(region => ({
      key: region.key,
      label: region.label,
      intensity: normalized.regions[region.key],
    }))
    .filter(region => region.intensity > 0)
    .sort((a, b) => b.intensity - a.intensity);

  if (max >= 7) {
    return {
      average,
      max,
      activeRegions,
      status: 'high',
      label: 'Dor alta',
      message: 'Sinalize cautela e considere reduzir impacto hoje. Isto nao substitui avaliacao profissional.',
    };
  }

  if (average >= 4 || max >= 5) {
    return {
      average,
      max,
      activeRegions,
      status: 'moderate',
      label: 'Dor moderada',
      message: 'Prefira aquecimento cuidadoso, amplitude confortavel e carga conservadora.',
    };
  }

  if (max > 0) {
    return {
      average,
      max,
      activeRegions,
      status: 'low',
      label: 'Dor leve',
      message: 'Monitore a resposta do corpo durante o treino e ajuste se a dor subir.',
    };
  }

  return {
    average,
    max,
    activeRegions,
    status: 'clear',
    label: 'Sem dor registrada',
    message: 'Nenhuma regiao foi marcada no check-in local de hoje.',
  };
}

export function summarizeCaffeine(
  entries: CaffeineEntry[],
  date = getDateKey()
): CaffeineSummary {
  const todayEntries = entries.filter(entry => entry.date === date && entry.amountMg > 0);
  const totalMg = todayEntries.reduce((sum, entry) => sum + entry.amountMg, 0);
  const lateMg = todayEntries.reduce((sum, entry) => {
    const hour = Number(entry.consumedAt.slice(0, 2));
    return Number.isFinite(hour) && hour >= 16 ? sum + entry.amountMg : sum;
  }, 0);

  if (totalMg === 0) {
    return {
      date,
      count: 0,
      totalMg,
      lateMg,
      level: 'none',
      label: 'Sem cafeina registrada',
      message: 'Nenhuma cafeina foi registrada hoje.',
    };
  }

  if (totalMg >= 400 || lateMg >= 160) {
    return {
      date,
      count: todayEntries.length,
      totalMg,
      lateMg,
      level: 'high',
      label: 'Impacto alto estimado',
      message: 'Dose total ou consumo tardio podem atrapalhar o sono em pessoas sensiveis.',
    };
  }

  if (totalMg >= 200 || lateMg > 0) {
    return {
      date,
      count: todayEntries.length,
      totalMg,
      lateMg,
      level: 'moderate',
      label: 'Impacto moderado estimado',
      message: 'Acompanhe horario e qualidade do sono antes de repetir o mesmo padrao.',
    };
  }

  return {
    date,
    count: todayEntries.length,
    totalMg,
    lateMg,
    level: 'low',
    label: 'Impacto baixo estimado',
    message: 'Registro dentro de uma faixa baixa para o dia, sem garantia individual.',
  };
}

function sessionAverageRpe(session: WorkoutSession): number {
  const rpeValues = session.exercises
    .flatMap(exercise => {
      if (exercise.sets?.length) return exercise.sets.map(set => set.rpe);
      return [exercise.rpe ?? 0];
    })
    .filter(value => Number.isFinite(value) && value > 0);

  if (!rpeValues.length) return 0;
  return rpeValues.reduce((sum, value) => sum + value, 0) / rpeValues.length;
}

export function calculateAccumulatedRpeLoad(
  history: WorkoutSession[],
  now = Date.now(),
  windowDays = 7
): RpeLoadSummary {
  const cutoff = now - windowDays * DAY_MS;
  const recentSessions = history.filter(session => session.completedAt >= cutoff);
  let totalLoad = 0;
  let rpeSum = 0;
  let sessionCount = 0;

  for (const session of recentSessions) {
    const averageRpe = sessionAverageRpe(session);
    if (averageRpe <= 0 || session.durationMinutes <= 0) continue;

    totalLoad += averageRpe * session.durationMinutes;
    rpeSum += averageRpe;
    sessionCount += 1;
  }

  const roundedLoad = Math.round(totalLoad);
  const averageSessionRpe = sessionCount ? Number((rpeSum / sessionCount).toFixed(1)) : 0;

  if (!sessionCount) {
    return {
      windowDays,
      sessionCount,
      totalLoad: 0,
      averageSessionRpe,
      level: 'none',
      label: 'Sem RPE recente',
      message: 'Finalize treinos com RPE para calcular carga interna acumulada.',
    };
  }

  if (roundedLoad >= 1600) {
    return {
      windowDays,
      sessionCount,
      totalLoad: roundedLoad,
      averageSessionRpe,
      level: 'very_high',
      label: 'Muito alta',
      message: 'Carga interna semanal muito alta. Considere reduzir intensidade ou volume.',
    };
  }

  if (roundedLoad >= 1000) {
    return {
      windowDays,
      sessionCount,
      totalLoad: roundedLoad,
      averageSessionRpe,
      level: 'high',
      label: 'Alta',
      message: 'Carga interna alta. Monitore sono, dor e queda de performance.',
    };
  }

  if (roundedLoad >= 500) {
    return {
      windowDays,
      sessionCount,
      totalLoad: roundedLoad,
      averageSessionRpe,
      level: 'moderate',
      label: 'Moderada',
      message: 'Carga interna moderada para os ultimos dias registrados.',
    };
  }

  return {
    windowDays,
    sessionCount,
    totalLoad: roundedLoad,
    averageSessionRpe,
    level: 'light',
    label: 'Leve',
    message: 'Carga interna leve nos ultimos dias registrados.',
  };
}

export function buildRecoveryModeRecommendation(args: {
  history: WorkoutSession[];
  painCheckin?: PainCheckin | null;
  caffeineEntries?: CaffeineEntry[];
  now?: number;
}): RecoveryModeRecommendation {
  const now = args.now ?? Date.now();
  const pain = summarizePainCheckin(args.painCheckin);
  const rpeLoad = calculateAccumulatedRpeLoad(args.history, now);
  const caffeine = summarizeCaffeine(args.caffeineEntries ?? [], getDateKey(now));
  const hasPainData = pain.activeRegions.length > 0;
  const hasCaffeineData = caffeine.count > 0;
  const hasRpeData = rpeLoad.sessionCount > 0;
  const reasons: string[] = [];

  if (!hasPainData && !hasCaffeineData && !hasRpeData) {
    return {
      mode: 'insufficient_data',
      label: 'Sem decisao automatica',
      message: 'Registre dor, cafeina ou treinos com RPE para estimar prontidao de recuperacao.',
      reasons: [],
    };
  }

  if (pain.max >= 8) reasons.push(`dor maxima ${pain.max}/10`);
  if (rpeLoad.level === 'very_high') reasons.push('RPE acumulado muito alto');
  if (caffeine.level === 'high') reasons.push('cafeina alta ou tardia');

  if (pain.max >= 8 || rpeLoad.level === 'very_high') {
    return {
      mode: 'day_off',
      label: 'Day off recomendado',
      message: 'Priorize descanso, caminhada leve ou mobilidade sem dor. Nao e diagnostico medico.',
      reasons,
    };
  }

  if (pain.status === 'high' || rpeLoad.level === 'high' || caffeine.level === 'high') {
    if (pain.status === 'high') reasons.push(pain.label.toLowerCase());
    if (rpeLoad.level === 'high') reasons.push('RPE acumulado alto');

    return {
      mode: 'active_recovery',
      label: 'Recuperacao ativa',
      message: 'Mantenha movimento leve, reduza carga e encerre se a dor aumentar.',
      reasons,
    };
  }

  if (pain.status === 'moderate' || rpeLoad.level === 'moderate' || caffeine.level === 'moderate') {
    if (pain.status === 'moderate') reasons.push(pain.label.toLowerCase());
    if (rpeLoad.level === 'moderate') reasons.push('RPE acumulado moderado');
    if (caffeine.level === 'moderate') reasons.push('cafeina com impacto estimado moderado');

    return {
      mode: 'adjusted_training',
      label: 'Treino ajustado',
      message: 'Treine com margem, evite falha e reavalie apos o aquecimento.',
      reasons,
    };
  }

  return {
    mode: 'train',
    label: 'Pronto para treinar',
    message: 'Os dados locais nao apontam necessidade de day off hoje.',
    reasons: ['dor baixa/ausente', 'carga interna controlada'],
  };
}
