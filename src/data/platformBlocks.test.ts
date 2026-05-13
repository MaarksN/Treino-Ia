import { describe, expect, it } from 'vitest';
import { DEFAULT_FEATURE_FLAGS } from '../config/featureFlags';
import { PLATFORM_BLOCKS, getCoverageSummary } from './platformBlocks';

describe('platform block registry', () => {
  it('keeps blocks 11-20 explicit with 20 items each', () => {
    expect(PLATFORM_BLOCKS).toHaveLength(10);

    for (const block of PLATFORM_BLOCKS) {
      expect(block.number).toBeGreaterThanOrEqual(11);
      expect(block.number).toBeLessThanOrEqual(20);
      expect(block.features).toHaveLength(20);
      expect(block.featureFlag in DEFAULT_FEATURE_FLAGS).toBe(true);

      const ids = new Set(block.features.map(feature => feature.id));
      expect(ids.size).toBe(20);
      expect([...ids].sort((a, b) => a - b)).toEqual(
        Array.from({ length: 20 }, (_, index) => index + 1),
      );

      const coverage = getCoverageSummary(block);
      expect(coverage.total).toBe(20);
      expect(coverage.active + coverage.fallback + coverage.roadmap).toBeLessThanOrEqual(20);
    }
  });
});
