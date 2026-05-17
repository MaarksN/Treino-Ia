import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearGeminiCache,
  createGeminiCacheKey,
  getGeminiCacheStats,
  readGeminiCache,
  writeGeminiCache,
} from './geminiCache';

describe('geminiCache', () => {
  beforeEach(() => {
    clearGeminiCache();
  });

  it('creates stable keys independent of object key order', () => {
    const first = createGeminiCacheKey({ model: 'gemini', contents: { b: 2, a: 1 } });
    const second = createGeminiCacheKey({ contents: { a: 1, b: 2 }, model: 'gemini' });

    expect(first).toBe(second);
  });

  it('does not cache inline image payloads', () => {
    const key = createGeminiCacheKey({
      contents: [{ inlineData: { data: 'base64', mimeType: 'image/png' } }],
    });

    expect(key).toBeNull();
  });

  it('expires entries by ttl', () => {
    writeGeminiCache('prompt', 'cached', 1000, 50);

    expect(readGeminiCache('prompt', 1020)).toBe('cached');
    expect(readGeminiCache('prompt', 1100)).toBeNull();
    expect(getGeminiCacheStats()).toMatchObject({ hits: 1, misses: 1, entries: 0 });
  });
});
