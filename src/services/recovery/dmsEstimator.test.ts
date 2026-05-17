import { describe, expect, it } from 'vitest';
import { estimateDomsRisk } from './dmsEstimator';

describe('Doms Estimator', () => {
  it('should return low risk for 0 volume', () => {
    const result = estimateDomsRisk(0, 0);
    expect(result.risk).toBe('baixo');
  });

  it('should return high risk for large volume and high RPE', () => {
    const result = estimateDomsRisk(1500, 9); // score 13500
    expect(result.risk).toBe('alto');
  });

  it('should return moderate risk for moderate score', () => {
    const result = estimateDomsRisk(800, 7.5); // score 6000
    expect(result.risk).toBe('moderado');
  });

  it('should return moderate risk if RPE is above 7 regardless of low score', () => {
    const result = estimateDomsRisk(100, 8); // score 800 but RPE 8
    expect(result.risk).toBe('moderado');
  });
});
