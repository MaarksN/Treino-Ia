import { beforeEach, describe, expect, it } from 'vitest';
import type { TrainingPlan } from '../database';
import { aiRecommendationRepository } from './aiRecommendationRepository';

function makePlan(id: string): TrainingPlan {
  return {
    id,
    createdAt: Date.now(),
    planName: id,
    goalDescription: 'Teste',
    volume: 'Medio',
    frequency: '4x',
    focus: 'Progressao',
    weeklySplit: 'Superior / Inferior',
    aiRecommendation: 'Base',
    nextRecommendation: 'Ajuste',
    days: [],
  };
}

describe('aiRecommendationRepository local fallback', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a pending plan recommendation without applying the proposed plan', async () => {
    const currentPlan = makePlan('current');
    const proposedPlan = makePlan('proposed');

    const record = await aiRecommendationRepository.createPendingPlanRecommendation({
      currentPlan,
      proposedPlan,
      reason: 'Sessao concluida',
      legacySourceSessionId: 'session-1',
    });

    expect(record.status).toBe('pending');
    expect(record.payload.currentPlan.id).toBe('current');
    expect(record.payload.proposedPlan.id).toBe('proposed');
  });

  it('marks accepted recommendations as applied', async () => {
    const record = await aiRecommendationRepository.createPendingPlanRecommendation({
      currentPlan: makePlan('current'),
      proposedPlan: makePlan('proposed'),
      reason: 'Sessao concluida',
      legacySourceSessionId: 'session-1',
    });

    const applied = await aiRecommendationRepository.markApplied(record, record.payload.proposedPlan);

    expect(applied.status).toBe('applied');
    expect(applied.acceptedAt).toBeTruthy();
    expect(applied.appliedAt).toBeTruthy();
  });

  it('records rejection without changing the proposed payload', async () => {
    const record = await aiRecommendationRepository.createPendingPlanRecommendation({
      currentPlan: makePlan('current'),
      proposedPlan: makePlan('proposed'),
      reason: 'Sessao concluida',
      legacySourceSessionId: 'session-1',
    });

    const rejected = await aiRecommendationRepository.reject(record);

    expect(rejected.status).toBe('rejected');
    expect(rejected.payload.currentPlan.id).toBe('current');
    expect(rejected.payload.proposedPlan.id).toBe('proposed');
  });

  it('records explicit keep-current-plan decisions as dismissed', async () => {
    const record = await aiRecommendationRepository.createPendingPlanRecommendation({
      currentPlan: makePlan('current'),
      proposedPlan: makePlan('proposed'),
      reason: 'Sessao concluida',
      legacySourceSessionId: 'session-1',
    });

    const dismissed = await aiRecommendationRepository.dismiss(record);

    expect(dismissed.status).toBe('dismissed');
    expect(dismissed.decisionReason).toBe('kept_current_plan');
  });
});
