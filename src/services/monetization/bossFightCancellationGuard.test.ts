import { describe, it, expect } from 'vitest';
import { validateBossFightCancellation } from './bossFightCancellationGuard';

describe('bossFightCancellationGuard', () => {
  it('should allow preview intent safely', () => {
    const response = validateBossFightCancellation('preview');
    expect(response.isSafe).toBe(true);
    expect(response.message).toContain('Preview de gamificação');
  });

  it('should block gamified flow on real_cancel intent', () => {
    const response = validateBossFightCancellation('real_cancel');
    expect(response.isSafe).toBe(false);
    expect(response.message).toContain('cancelamento real deve ser direto');
  });
});
