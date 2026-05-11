import { describe, expect, it } from 'vitest';
import { AiDecisionAudit } from '../types/aiPersonalization';
import { summarizeAiDecisionQuality } from './aiDecisionObservability';

function audit(overrides: Partial<AiDecisionAudit>): AiDecisionAudit {
  return {
    feature: 'generateWeeklyAiInsights',
    usedAi: true,
    usedDeterministicFallback: false,
    deterministicFlags: [],
    validationStatus: 'valid',
    reason: 'ok',
    createdAt: '2026-05-11T00:00:00.000Z',
    ...overrides,
  };
}

describe('aiDecisionObservability', () => {
  it('resume sucesso de IA, fallback e invalidos por feature', () => {
    const metrics = summarizeAiDecisionQuality([
      audit({ feature: 'weekly', validationStatus: 'valid', usedAi: true }),
      audit({
        feature: 'weekly',
        usedAi: false,
        usedDeterministicFallback: true,
        validationStatus: 'invalid_schema',
        reason: 'schema errado',
      }),
      audit({
        feature: 'deload',
        usedAi: false,
        usedDeterministicFallback: true,
        validationStatus: 'blocked',
        reason: 'guardrail critico',
      }),
    ]);

    expect(metrics.totalDecisions).toBe(3);
    expect(metrics.aiSuccesses).toBe(1);
    expect(metrics.deterministicFallbacks).toBe(2);
    expect(metrics.fallbackRate).toBeCloseTo(2 / 3);
    expect(metrics.invalidResponseRate).toBeCloseTo(1 / 3);
    expect(metrics.blockedRate).toBeCloseTo(1 / 3);
    expect(metrics.byFeature.weekly.fallbackRate).toBe(0.5);
    expect(metrics.byFeature.deload.lastValidationStatus).toBe('blocked');
  });
});
