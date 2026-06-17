import { redactSensitiveData } from './redact';

export type SecurityEventType =
  | 'cors_denied'
  | 'gemini_rate_limited'
  | 'gemini_payload_rejected'
  | 'unauthorized_access';

export interface SecurityEvent {
  type: SecurityEventType;
  route: string;
  subject?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

function summarizeSubject(subject?: string): string | undefined {
  if (!subject) return undefined;
  if (subject.length <= 16) return subject;
  return `${subject.slice(0, 8)}...${subject.slice(-4)}`;
}

export function logSecurityEvent(event: SecurityEvent): void {
  console.warn('[security]', {
    type: event.type,
    route: event.route,
    subject: summarizeSubject(event.subject),
    correlationId: event.correlationId,
    metadata: redactSensitiveData(event.metadata ?? {}),
  });
}

export function logUnauthorizedAccess(
  route: string,
  metadata?: Record<string, unknown>,
  correlationId?: string,
): void {
  logSecurityEvent({
    type: 'unauthorized_access',
    route,
    correlationId,
    metadata,
  });
}
