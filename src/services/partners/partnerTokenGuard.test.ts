import { describe, it, expect } from 'vitest';
import { checkPartnerTokenAvailability } from './partnerTokenGuard';

describe('partnerTokenGuard', () => {
  it('should explicitly block real token generation without backend validation', () => {
    const response = checkPartnerTokenAvailability();
    expect(response.isBlocked).toBe(true);
    expect(response.message).toContain('exigem backend e parceria física');
  });
});
