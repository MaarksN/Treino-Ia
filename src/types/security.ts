export interface AuditEvent {
  id: string;
  type: string;
  actor: string;
  detail: string;
  createdAt: string;
}

export interface CookieConsentState {
  necessary: true;
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
  updatedAt: string;
}

export interface ActiveSessionRecord {
  id: string;
  device: string;
  location: string;
  lastSeenAt: string;
  current: boolean;
}
