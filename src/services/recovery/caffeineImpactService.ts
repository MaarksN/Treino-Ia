export const CAFFEINE_PRESETS = {
  'cafe-pequeno': 80,
  'cafe-grande': 140,
  energetico: 120,
  'pre-treino': 200,
} as const;

const STORAGE_KEY = '@TreinoIA:recovery:caffeine';

export interface CaffeineEntry {
  mg: number;
  loggedAt: number;
}

export function sanitizeCaffeineMg(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(1000, Math.max(0, Math.round(numeric)));
}

export function saveCaffeineEntry(mgInput: unknown, loggedAt = Date.now()): CaffeineEntry[] {
  const current = getCaffeineEntries();
  const next = [...current, { mg: sanitizeCaffeineMg(mgInput), loggedAt }].slice(-30);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function getCaffeineEntries(): CaffeineEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CaffeineEntry[];
    return parsed
      .map(e => ({ mg: sanitizeCaffeineMg(e.mg), loggedAt: Number(e.loggedAt) || 0 }))
      .filter(e => e.mg > 0 && e.loggedAt > 0);
  } catch {
    return [];
  }
}

export function estimateCaffeineImpact(entries: CaffeineEntry[], sleepHour = 23): { totalMg: number; nearSleepMg: number; message: string } {
  const totalMg = entries.reduce((sum, entry) => sum + entry.mg, 0);
  const nearSleepMg = entries.reduce((sum, entry) => {
    const hour = new Date(entry.loggedAt).getHours();
    return hour >= sleepHour - 6 ? sum + entry.mg : sum;
  }, 0);

  if (!entries.length) return { totalMg, nearSleepMg, message: 'Sem consumo de cafeína registrado hoje.' };
  if (nearSleepMg >= 120) return { totalMg, nearSleepMg, message: 'Cafeína próxima do sono pode atrapalhar sua recuperação hoje.' };
  if (totalMg >= 350) return { totalMg, nearSleepMg, message: 'Consumo alto de cafeína hoje. Considere reduzir no fim do dia.' };
  return { totalMg, nearSleepMg, message: 'Consumo de cafeína dentro de uma faixa moderada hoje.' };
}
