import type { RecoveryCheckin, UserProfile } from '../../types';

export const parseRestToSeconds = (rest: string) => {
  const match = rest.match(/\d+/);
  return match ? Number(match[0]) : 90;
};

export const RECOVERY_FIELDS = [
  { key: 'sorenessLevel', label: 'Dor' },
  { key: 'stressLevel', label: 'Stress' },
  { key: 'energyLevel', label: 'Energia' },
] as const;

export function createDefaultReadiness(profile: UserProfile | null): RecoveryCheckin {
  const parsedSleep = Number(profile?.sleepHours || 7);
  return {
    sleepHours: Number.isFinite(parsedSleep) ? parsedSleep : 7,
    stressLevel: profile?.stressLevel === 'Alto' ? 8 : profile?.stressLevel === 'Baixo' ? 3 : 5,
    sorenessLevel: 4,
    energyLevel: 7,
    timestamp: Date.now(),
  };
}

export function formatAiPanelResult(result: unknown): string {
  if (typeof result === 'string') return result;
  if (!result || typeof result !== 'object') return 'Sem resposta estruturada.';

  const maybeStructured = result as { data?: unknown; audit?: { reason?: string; deterministicFlags?: string[] } };
  if (!('data' in maybeStructured)) return JSON.stringify(result, null, 2);

  const flags = maybeStructured.audit?.deterministicFlags?.length
    ? `\n\nAuditoria: ${maybeStructured.audit.deterministicFlags.join(', ')}`
    : maybeStructured.audit?.reason
      ? `\n\nAuditoria: ${maybeStructured.audit.reason}`
      : '';

  return `${JSON.stringify(maybeStructured.data, null, 2)}${flags}`;
}
