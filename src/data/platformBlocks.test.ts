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
      expect(['core', 'beta', 'internal', 'off']).toContain(block.surfaceStatus);

      const ids = new Set(block.features.map((feature) => feature.id));
      expect(ids.size).toBe(20);
      expect([...ids].sort((a, b) => a - b)).toEqual(
        Array.from({ length: 20 }, (_, index) => index + 1),
      );

      const coverage = getCoverageSummary(block);
      expect(coverage.total).toBe(20);
      expect(coverage.active + coverage.fallback + coverage.roadmap).toBeLessThanOrEqual(20);
    }
  });

  it('classifies platform blocks for the private beta surface', () => {
    const statuses = Object.fromEntries(
      PLATFORM_BLOCKS.map((block) => [block.id, block.surfaceStatus]),
    );

    expect(statuses).toMatchObject({
      'bloco-11': 'core',
      'bloco-12': 'core',
      'bloco-13': 'beta',
      'bloco-14': 'beta',
      'bloco-15': 'internal',
      'bloco-19': 'internal',
      'bloco-20': 'internal',
    });
  });
});
