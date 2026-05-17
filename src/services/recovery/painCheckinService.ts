export const PAIN_REGIONS = ['ombros', 'costas', 'joelhos', 'quadril', 'cotovelos', 'punhos', 'tornozelos'] as const;

export type PainRegion = (typeof PAIN_REGIONS)[number];
export type PainMap = Record<PainRegion, number>;

export interface PainCheckinRecord {
  createdAt: number;
  notes: string;
  pain: PainMap;
}

const STORAGE_KEY = '@TreinoIA:recovery:pain-checkin';

export function createEmptyPainMap(): PainMap {
  return PAIN_REGIONS.reduce((acc, region) => ({ ...acc, [region]: 0 }), {} as PainMap);
}

export function clampPainLevel(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(10, Math.max(0, Math.round(numeric)));
}

export function sanitizePainMap(input: Partial<Record<PainRegion, unknown>> | null | undefined): PainMap {
  const base = createEmptyPainMap();
  for (const region of PAIN_REGIONS) {
    base[region] = clampPainLevel(input?.[region]);
  }
  return base;
}

export function savePainCheckin(input: Partial<PainCheckinRecord>): PainCheckinRecord {
  const record: PainCheckinRecord = {
    createdAt: Number.isFinite(input.createdAt) ? Number(input.createdAt) : Date.now(),
    notes: typeof input.notes === 'string' ? input.notes.trim().slice(0, 240) : '',
    pain: sanitizePainMap(input.pain),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  return record;
}

export function getPainCheckin(): PainCheckinRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { createdAt: 0, notes: '', pain: createEmptyPainMap() };
    const parsed = JSON.parse(raw) as Partial<PainCheckinRecord>;
    return {
      createdAt: Number.isFinite(parsed.createdAt) ? Number(parsed.createdAt) : 0,
      notes: typeof parsed.notes === 'string' ? parsed.notes : '',
      pain: sanitizePainMap(parsed.pain),
    };
  } catch {
    return { createdAt: 0, notes: '', pain: createEmptyPainMap() };
  }
}
