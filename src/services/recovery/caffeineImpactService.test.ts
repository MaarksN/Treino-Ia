import { describe, expect, it } from 'vitest';
import { estimateCaffeineWindow, isNearBedtime } from './caffeineImpactService';

describe('caffeineImpactService', () => {
  it('estimates impact', () => {
    expect(estimateCaffeineWindow(320)).toContain('alto');
    expect(isNearBedtime('18:30')).toBe(true);
  });
});
