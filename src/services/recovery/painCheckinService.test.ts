import { describe, expect, it } from 'vitest';
import { clampPainIntensity } from './painCheckinService';

describe('painCheckinService', () => {
  it('clamps intensity', () => {
    expect(clampPainIntensity(13)).toBe(10);
    expect(clampPainIntensity(-2)).toBe(0);
  });
});
