export const PAIN_CHECKIN_STORAGE_KEY = '@TreinoIA:painCheckin';

export type PainRegion = 'ombros' | 'costas' | 'joelhos' | 'quadril' | 'cotovelos' | 'punhos' | 'tornozelos';

export interface PainCheckinRecord {
  region: PainRegion;
  intensity: number;
  createdAt: number;
}

export function clampPainIntensity(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value)));
}

export function readPainCheckins(storage: Storage = localStorage): PainCheckinRecord[] {
  try {
    const raw = storage.getItem(PAIN_CHECKIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) as PainCheckinRecord[] : [];
  } catch {
    return [];
  }
}

export function savePainCheckin(record: PainCheckinRecord, storage: Storage = localStorage): PainCheckinRecord[] {
  const normalized = { ...record, intensity: clampPainIntensity(record.intensity) };
  const next = [normalized, ...readPainCheckins(storage)].slice(0, 30);
  storage.setItem(PAIN_CHECKIN_STORAGE_KEY, JSON.stringify(next));
  return next;
}
