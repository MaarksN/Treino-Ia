import { type WorkoutSession } from '../database';

export interface SleepStrengthEntry {
  sleepHours: number;
  strengthScore: number;
}

export interface SleepLogEntry {
  date: string;
  sleepHours: number;
  updatedAt: number;
}

export interface SleepStrengthPair extends SleepStrengthEntry {
  date: string;
  sessionId: string;
}

export interface SleepStrengthInsight {
  status: 'insufficient_data' | 'positive' | 'neutral' | 'negative';
  sampleCount: number;
  correlation: number;
  label: string;
  message: string;
}

export function calculateSleepStrengthCorrelation(entries: SleepStrengthEntry[]): number {
  if (entries.length < 3) return 0;
  const meanSleep = entries.reduce((sum, e) => sum + e.sleepHours, 0) / entries.length;
  const meanStrength = entries.reduce((sum, e) => sum + e.strengthScore, 0) / entries.length;

  let numerator = 0;
  let sleepVariance = 0;
  let strengthVariance = 0;

  for (const entry of entries) {
    const sleepDiff = entry.sleepHours - meanSleep;
    const strengthDiff = entry.strengthScore - meanStrength;
    numerator += sleepDiff * strengthDiff;
    sleepVariance += sleepDiff ** 2;
    strengthVariance += strengthDiff ** 2;
  }

  const denominator = Math.sqrt(sleepVariance * strengthVariance);
  if (!denominator) return 0;
  return Number((numerator / denominator).toFixed(3));
}

export function normalizeSleepHours(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(14, Math.max(0, Number(parsed.toFixed(1))));
}

export function createSleepStrengthPairs(
  sleepLogs: SleepLogEntry[],
  history: WorkoutSession[]
): SleepStrengthPair[] {
  const sleepByDate = new Map(
    sleepLogs
      .map(log => [log.date, normalizeSleepHours(log.sleepHours)] as const)
      .filter(([, sleepHours]) => sleepHours > 0)
  );

  return history
    .map(session => {
      const date = new Date(session.completedAt).toISOString().slice(0, 10);
      const sleepHours = sleepByDate.get(date);
      const strengthScore = Math.round(session.totalVolume);

      if (!sleepHours || strengthScore <= 0) return null;

      return {
        date,
        sessionId: session.id,
        sleepHours,
        strengthScore,
      };
    })
    .filter((pair): pair is SleepStrengthPair => Boolean(pair));
}

export function buildSleepStrengthInsight(
  sleepLogs: SleepLogEntry[],
  history: WorkoutSession[]
): SleepStrengthInsight {
  const pairs = createSleepStrengthPairs(sleepLogs, history);
  const correlation = calculateSleepStrengthCorrelation(pairs);

  if (pairs.length < 3) {
    return {
      status: 'insufficient_data',
      sampleCount: pairs.length,
      correlation: 0,
      label: 'Dados insuficientes',
      message: 'Registre sono em pelo menos 3 dias com treino finalizado para estimar uma correlacao honesta.',
    };
  }

  if (correlation >= 0.35) {
    return {
      status: 'positive',
      sampleCount: pairs.length,
      correlation,
      label: 'Tendencia positiva',
      message: 'Nos dados locais, noites maiores tendem a acompanhar melhor desempenho de volume.',
    };
  }

  if (correlation <= -0.35) {
    return {
      status: 'negative',
      sampleCount: pairs.length,
      correlation,
      label: 'Tendencia inversa',
      message: 'Os dados locais ainda nao mostram melhora de volume junto com mais sono; revise contexto, carga e rotina.',
    };
  }

  return {
    status: 'neutral',
    sampleCount: pairs.length,
    correlation,
    label: 'Sem relacao forte',
    message: 'A amostra local nao mostra uma relacao clara entre sono e volume neste momento.',
  };
}
