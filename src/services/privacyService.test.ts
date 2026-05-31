import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadCookieConsent, PRIVACY_POLICY_VERSION, saveCookieConsent } from './privacyService';

vi.mock('./auditLogService', () => ({
  logAuditEvent: vi.fn(),
}));

describe('privacyService consent versioning', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores the current privacy policy version with cookie consent', () => {
    const consent = saveCookieConsent({
      analytics: true,
      personalization: false,
      marketing: false,
    });

    expect(consent.policyVersion).toBe(PRIVACY_POLICY_VERSION);
    expect(JSON.parse(localStorage.getItem('@TreinoApp:cookie-consent') ?? '{}')).toMatchObject({
      policyVersion: PRIVACY_POLICY_VERSION,
      analytics: true,
      personalization: false,
      marketing: false,
    });
  });

  it('backfills policy version for legacy stored consent', () => {
    localStorage.setItem('@TreinoApp:cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      personalization: true,
      marketing: false,
      updatedAt: '2026-05-01T00:00:00.000Z',
    }));

    expect(loadCookieConsent()).toMatchObject({
      policyVersion: PRIVACY_POLICY_VERSION,
      updatedAt: '2026-05-01T00:00:00.000Z',
    });
  });
});
