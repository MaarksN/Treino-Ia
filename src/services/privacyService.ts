import { CookieConsentState } from '../types/security';
import { logAuditEvent } from './auditLogService';

const COOKIE_KEY = '@TreinoApp:cookie-consent';
export const PRIVACY_POLICY_VERSION = '2026-05-31';

export function loadCookieConsent(): CookieConsentState {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
      return {
        necessary: true,
        analytics: Boolean(parsed.analytics),
        personalization: parsed.personalization ?? true,
        marketing: Boolean(parsed.marketing),
        policyVersion: parsed.policyVersion ?? PRIVACY_POLICY_VERSION,
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      };
    }
  } catch {
    // fallback below
  }

  return {
    necessary: true,
    analytics: false,
    personalization: true,
    marketing: false,
    policyVersion: PRIVACY_POLICY_VERSION,
    updatedAt: new Date().toISOString(),
  };
}

export function saveCookieConsent(consent: Omit<CookieConsentState, 'necessary' | 'updatedAt' | 'policyVersion'>) {
  const next: CookieConsentState = {
    necessary: true,
    ...consent,
    policyVersion: PRIVACY_POLICY_VERSION,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(COOKIE_KEY, JSON.stringify(next));
  logAuditEvent('privacy.cookie_consent_updated', 'Preferencias de cookies atualizadas.');
  return next;
}

export function exportPrivacyData() {
  const exportable: Record<string, unknown> = {};

  Object.keys(localStorage)
    .filter(key => key.startsWith('@TreinoApp:'))
    .forEach(key => {
      exportable[key] = localStorage.getItem(key);
    });

  logAuditEvent('privacy.data_exported', 'Exportacao local LGPD solicitada.');
  return {
    exportedAt: new Date().toISOString(),
    data: exportable,
  };
}

export function deleteLocalAccountData() {
  Object.keys(localStorage)
    .filter(key => key.startsWith('@TreinoApp:'))
    .forEach(key => localStorage.removeItem(key));

  logAuditEvent('privacy.local_data_deleted', 'Dados locais removidos neste dispositivo.');
}
