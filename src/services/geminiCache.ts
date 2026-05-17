export interface GeminiCacheStats {
  entries: number;
  hits: number;
  misses: number;
}

interface GeminiCacheEntry {
  text: string;
  expiresAt: number;
}

export const DEFAULT_GEMINI_CACHE_TTL_MS = 5 * 60 * 1000;

const geminiCache = new Map<string, GeminiCacheEntry>();
const stats: GeminiCacheStats = {
  entries: 0,
  hits: 0,
  misses: 0,
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(item => stableStringify(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

function containsInlineData(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsInlineData);
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;
  if ('inlineData' in record) return true;
  return Object.values(record).some(containsInlineData);
}

export function createGeminiCacheKey(request: unknown): string | null {
  if (containsInlineData(request)) return null;
  return stableStringify(request);
}

export function readGeminiCache(key: string, now = Date.now()): string | null {
  const entry = geminiCache.get(key);
  if (!entry) {
    stats.misses += 1;
    return null;
  }

  if (entry.expiresAt <= now) {
    geminiCache.delete(key);
    stats.entries = geminiCache.size;
    stats.misses += 1;
    return null;
  }

  stats.hits += 1;
  return entry.text;
}

export function writeGeminiCache(
  key: string,
  text: string,
  now = Date.now(),
  ttlMs = DEFAULT_GEMINI_CACHE_TTL_MS,
): void {
  geminiCache.set(key, {
    text,
    expiresAt: now + ttlMs,
  });
  stats.entries = geminiCache.size;
}

export function clearGeminiCache(): void {
  geminiCache.clear();
  stats.entries = 0;
  stats.hits = 0;
  stats.misses = 0;
}

export function getGeminiCacheStats(): GeminiCacheStats {
  return {
    ...stats,
    entries: geminiCache.size,
  };
}
