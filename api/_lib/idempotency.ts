export function buildIdempotencyKey(userId: string, eventType: string, sourceId?: string | null, period: string = ''): string {
  const parts = [userId, eventType];
  if (sourceId) parts.push(sourceId);
  if (period) parts.push(period);
  return parts.join(':');
}

export function getDailyPeriod(date: Date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function normalizeEventKey(eventType: string, sourceId?: string | null): string {
  return sourceId ? `${eventType}:${sourceId}` : eventType;
}
