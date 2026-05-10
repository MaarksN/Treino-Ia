import { CookieConsentState } from '../types/security';
import { logAuditEvent } from './auditLogService';

const COOKIE_KEY = '@TreinoApp:cookie-consent';

export function loadCookieConsent(): CookieConsentState {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (raw) return JSON.parse(raw) as CookieConsentState;
  } catch {
    // fallback below
  }

  return {
    necessary: true,
    analytics: false,
    personalization: true,
    marketing: false,
    updatedAt: new Date().toISOString(),
  };
}

export function saveCookieConsent(consent: Omit<CookieConsentState, 'necessary' | 'updatedAt'>) {
  const next: CookieConsentState = {
    necessary: true,
    ...consent,
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
