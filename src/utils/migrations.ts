import { LEGACY_KEYS, STORAGE_KEYS, StorageEnvelope, CURRENT_STORAGE_VERSION } from './storageSchema';

function safeParse<T>(data: string | null): T | null {
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export function migrateStorage() {
  if (typeof window === 'undefined') return;

  const migrateKey = (legacyKeys: string[], newKey: string) => {
    // Check if new key already exists (already migrated)
    if (localStorage.getItem(newKey)) return;

    let migratedData = null;
    for (const legacyKey of legacyKeys) {
      const data = localStorage.getItem(legacyKey);
      if (data) {
        migratedData = safeParse(data);
        if (migratedData) break;
      }
    }

    if (migratedData) {
      const envelope: StorageEnvelope<unknown> = {
        version: CURRENT_STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        data: migratedData,
      };
      localStorage.setItem(newKey, JSON.stringify(envelope));
    }
  };

  migrateKey([LEGACY_KEYS.IA_PROFILE, LEGACY_KEYS.PROFILE], STORAGE_KEYS.PROFILE);
  migrateKey([LEGACY_KEYS.IA_PLAN, LEGACY_KEYS.PLAN], STORAGE_KEYS.PLAN);
  migrateKey([LEGACY_KEYS.IA_HISTORY, LEGACY_KEYS.HISTORY], STORAGE_KEYS.HISTORY);
}
