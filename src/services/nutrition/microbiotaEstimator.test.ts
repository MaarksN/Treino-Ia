import { describe, expect, it } from 'vitest';
import { estimateMicrobiotaHealth } from './microbiotaEstimator';

describe('Microbiota Estimator', () => {
  it('should return unknown for 0 calories', () => {
    const result = estimateMicrobiotaHealth(10, 0);
    expect(result.status).toBe('unknown');
  });

  it('should recommend more fiber if intake is low', () => {
    const result = estimateMicrobiotaHealth(10, 2000); // 2000 kcal needs 28g
    expect(result.status).toBe('needs_fiber');
    expect(result.recommendedFibersGrams).toBe(28);
  });

  it('should return healthy if fiber intake is sufficient', () => {
    const result = estimateMicrobiotaHealth(30, 2000);
    expect(result.status).toBe('healthy');
  });
});
