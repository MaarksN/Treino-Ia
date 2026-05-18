import { describe, expect, it } from 'vitest';
import { pruneBoundedTtlCache, setBoundedTtlCacheEntry } from './boundedTtlCache';

describe('boundedTtlCache', () => {
  it('removes expired entries', () => {
    const cache = new Map([
      ['expired', { expiresAt: 10 }],
      ['fresh', { expiresAt: 30 }],
    ]);

    pruneBoundedTtlCache(cache, { maxEntries: 10, now: 20 });

    expect([...cache.keys()]).toEqual(['fresh']);
  });

  it('does not grow indefinitely', () => {
    const cache = new Map<string, { expiresAt: number }>();

    setBoundedTtlCacheEntry(cache, 'a', { expiresAt: 100 }, { maxEntries: 2, now: 1 });
    setBoundedTtlCacheEntry(cache, 'b', { expiresAt: 200 }, { maxEntries: 2, now: 1 });
    setBoundedTtlCacheEntry(cache, 'c', { expiresAt: 300 }, { maxEntries: 2, now: 1 });

    expect(cache.size).toBe(2);
    expect([...cache.keys()]).toEqual(['b', 'c']);
  });
});
