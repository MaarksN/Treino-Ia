import { classifyDataSensitivity } from './sensitiveStoragePolicy';

export interface PrivacyCategorySummary { key: string; sensitivity: string; }

const SCOPE_PREFIXES = ['@TreinoApp:', '@TreinoIA:'];

export function listLocalPrivacyCategories(storage: Storage = localStorage): PrivacyCategorySummary[] {
  const output: PrivacyCategorySummary[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key) continue;
    if (!SCOPE_PREFIXES.some(prefix => key.startsWith(prefix))) continue;
    const value = storage.getItem(key);
    output.push({ key, sensitivity: classifyDataSensitivity(key, value) });
  }
  return output;
}

export function exportLocalPrivacyData(storage: Storage = localStorage): Record<string, unknown> {
  const exportData: Record<string, unknown> = {};
  listLocalPrivacyCategories(storage).forEach(({ key }) => {
    const raw = storage.getItem(key);
    exportData[key] = raw && raw.length > 6000 ? `${raw.slice(0, 6000)}...[TRUNCATED]` : raw;
  });
  return exportData;
}

export function clearSensitiveLocalData(storage: Storage = localStorage): string[] {
  const removed: string[] = [];
  listLocalPrivacyCategories(storage).forEach(({ key, sensitivity }) => {
    if (['sensitive_health', 'sensitive_image', 'credential', 'personal'].includes(sensitivity)) {
      storage.removeItem(key);
      removed.push(key);
    }
  });
  return removed;
}

export function getPrivacyLocalOnlyNotice(): string {
  return 'Esta ação exporta/remove apenas dados locais do navegador. Não representa exclusão LGPD completa em backend.';
}
