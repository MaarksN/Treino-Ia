import { describe, it, expect } from 'vitest';
import { evaluateFormSafely } from './aiFormChecker';

describe('aiFormChecker', () => {
  it('should safely return unavailable status due to blocked dependency', () => {
    const result = evaluateFormSafely({});
    expect(result.isAvailable).toBe(false);
    expect(result.blockedReason).toBe('blocked_external_dependency');
    expect(result.score).toBe(0);
  });
});
