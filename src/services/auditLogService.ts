import { AuditEvent } from '../types/security';

const AUDIT_KEY = '@TreinoApp:audit-log';

export function logAuditEvent(type: string, detail: string, actor = 'local-user') {
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    type,
    actor,
    detail,
    createdAt: new Date().toISOString(),
  };

  const events = loadAuditEvents();
  localStorage.setItem(AUDIT_KEY, JSON.stringify([event, ...events].slice(0, 200)));
  return event;
}

export function loadAuditEvents(): AuditEvent[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]') as AuditEvent[];
  } catch {
    return [];
  }
}
