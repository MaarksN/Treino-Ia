import { beforeEach, describe, expect, it } from 'vitest';
import { clampPainLevel, getPainCheckin, savePainCheckin } from './painCheckinService';

describe('painCheckinService', () => {
  beforeEach(() => localStorage.clear());
  it('clamps pain values', () => {
    expect(clampPainLevel(11)).toBe(10);
    expect(clampPainLevel(-1)).toBe(0);
  });
  it('persists record locally', () => {
    savePainCheckin({ pain: { ombros: 7 } as never });
    expect(getPainCheckin().pain.ombros).toBe(7);
  });
});
