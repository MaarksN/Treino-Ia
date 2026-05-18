export interface ExpiringCacheEntry {
  expiresAt: number;
}

export interface BoundedTtlCacheOptions {
  maxEntries: number;
  now?: number;
}

export function pruneBoundedTtlCache<T extends ExpiringCacheEntry>(
  cache: Map<string, T>,
  options: BoundedTtlCacheOptions,
): void {
  const now = options.now ?? Date.now();

  for (const [key, value] of cache.entries()) {
    if (value.expiresAt <= now) {
      cache.delete(key);
    }
  }

  if (cache.size <= options.maxEntries) return;

  const entriesByExpiry = [...cache.entries()]
    .sort(([, left], [, right]) => left.expiresAt - right.expiresAt);

  for (const [key] of entriesByExpiry) {
    if (cache.size <= options.maxEntries) return;
    cache.delete(key);
  }
}

export function setBoundedTtlCacheEntry<T extends ExpiringCacheEntry>(
  cache: Map<string, T>,
  key: string,
  value: T,
  options: BoundedTtlCacheOptions,
): void {
  pruneBoundedTtlCache(cache, options);
  cache.set(key, value);
  pruneBoundedTtlCache(cache, options);
}
