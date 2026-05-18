import { describe, it, expect } from 'vitest';
import { safeAiJsonParser } from './safeAiJsonParser';

describe('safeAiJsonParser', () => {
  const guard = (value: unknown): value is { name: string } => Boolean(value) && typeof value === 'object' && typeof (value as { name?: unknown }).name === 'string';
  it('parses valid json', () => expect(safeAiJsonParser('{"name":"ok"}', guard).ok).toBe(true));
  it('fails invalid json', () => expect(safeAiJsonParser('{', guard).ok).toBe(false));
  it('fails missing fields', () => expect(safeAiJsonParser('{"age":1}', guard).ok).toBe(false));
  it('accepts extra fields', () => expect(safeAiJsonParser('{"name":"ok","x":1}', guard).ok).toBe(true));
  it('extracts json from wrappers', () => expect(safeAiJsonParser('text {"name":"ok"} tail', guard).ok).toBe(true));
  it('returns fallback on failure', () => {
    const result = safeAiJsonParser('{', guard, { name: 'fallback' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fallback?.name).toBe('fallback');
  });
});
