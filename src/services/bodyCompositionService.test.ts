import { describe, expect, it } from 'vitest';
import { calculateRecompositionProgress, validateBodyMetricInput, validateRecompositionGoalInput } from './bodyCompositionService';
import { BodyMetric } from '../types';

describe('bodyCompositionService', () => {
  it('requires at least one body measurement', () => {
    expect(() => validateBodyMetricInput({})).toThrow('pelo menos uma medida');
  });

  it('validates recomposition goal targets', () => {
    const latest: BodyMetric = { id: 'm1', date: '2026-05-01', weight: 82, bodyFatPercent: 20, waist: 92 };
    const goal = validateRecompositionGoalInput({
      title: 'Recomp 12 semanas',
      targetDate: '2026-08-01',
      targetBodyFatPercent: 16,
      targetWaist: 86,
    }, latest);

    expect(goal.startBodyFatPercent).toBe(20);
    expect(goal.targetWaist).toBe(86);
  });

  it('calculates progress against latest measurements', () => {
    const metrics: BodyMetric[] = [
      { id: 'm1', date: '2026-05-01', weight: 82, bodyFatPercent: 20, waist: 92 },
      { id: 'm2', date: '2026-06-01', weight: 80, bodyFatPercent: 18, waist: 89 },
    ];
    const progress = calculateRecompositionProgress(metrics, [{
      id: 'g1',
      title: 'Recomp',
      createdAt: '2026-05-01T00:00:00Z',
      targetDate: '2026-08-01',
      status: 'active',
      startBodyFatPercent: 20,
      targetBodyFatPercent: 16,
      startWaist: 92,
      targetWaist: 86,
    }]);

    expect(progress[0].percent).toBe(50);
    expect(progress[0].currentWaist).toBe(89);
  });
});
