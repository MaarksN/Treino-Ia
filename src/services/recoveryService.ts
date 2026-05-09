import { RecoveryCheckin } from '../types';

export function getRecoveryScore(checkin: RecoveryCheckin) {
  const sleepScore = Math.min(checkin.sleepHours, 8) * 10;
  const sorenessPenalty = checkin.sorenessLevel * 5;
  const stressPenalty = checkin.stressLevel * 4;
  const energyScore = checkin.energyLevel * 8;
  const score = Math.max(0, Math.min(100, sleepScore + energyScore - sorenessPenalty - stressPenalty));

  if (score >= 70) return { score, label: 'Alta', modifier: 'normal' as const };
  if (score >= 45) return { score, label: 'Média', modifier: 'reduced' as const };
  return { score, label: 'Baixa', modifier: 'light' as const };
}
