import { describe, expect, it } from 'vitest';
import { estimateMicrobiotaHealth } from '../../services/nutrition/microbiotaEstimator';

describe('MicrobiotaWidget', () => {
  it('returns an educational healthy fiber message when data is provided', () => {
    const insight = estimateMicrobiotaHealth(30, 2000);

    expect(insight.status).toBe('healthy');
    expect(insight.message).toContain('microbiota saudável');
    expect(insight.recommendedFibersGrams).toBe(28);
  });

  it('returns unknown state message for missing calories', () => {
    const insight = estimateMicrobiotaHealth(0, 0);

    expect(insight.status).toBe('unknown');
    expect(insight.message).toContain('Sem dados nutricionais suficientes');
  });
});
