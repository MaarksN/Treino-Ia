import { describe, it, expect } from 'vitest';
import { getAiModelPolicy } from './aiModelPolicy';

describe('aiModelPolicy', () => {
  it('returns policy by task', () => {
    expect(getAiModelPolicy('training_plan').model).toBe('gemini-2.5-pro');
    expect(getAiModelPolicy('meal_scan').allowMultimodal).toBe(true);
  });
});
