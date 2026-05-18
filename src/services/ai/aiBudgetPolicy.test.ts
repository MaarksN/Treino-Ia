import { describe, it, expect } from 'vitest';
import { getAiBudgetPolicy } from './aiBudgetPolicy';

describe('aiBudgetPolicy', () => {
  it('returns timeout and retry policies', () => {
    expect(getAiBudgetPolicy('training_plan').timeoutMs).toBe(30000);
    expect(getAiBudgetPolicy('generic').maxRetries).toBe(0);
  });
});
