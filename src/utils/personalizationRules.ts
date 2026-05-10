import { RecoveryCheckin, UserProfile, WorkoutSession } from '../types';

export interface DeterministicFlags {
  plateauRisk: 'baixo' | 'medio' | 'alto';
  deloadNeeded: boolean;
  adherenceRisk: 'baixo' | 'medio' | 'alto';
  recommendedFrequency: number;
}

export function validateAvailableMinutes(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Tempo disponível inválido.');
  }
  return Math.max(15, Math.min(180, Math.round(value)));
}

export function computeDeterministicFlags(
  profile: UserProfile,
  sessions: WorkoutSession[],
  recovery?: RecoveryCheckin
): DeterministicFlags {
  const recent = sessions.slice(-12);
  const avgRpe = average(recent.flatMap(session => session.logs.map(log => log.rpe || 0)).filter(Boolean));
  const completionRate = recent.length / 12;
  const volumeSeries = recent.map(session =>
    session.logs.reduce((sum, log) => sum + (log.actualWeight || 0) * estimateReps(log.actualReps), 0)
  ).filter(v => v > 0);
  const range = volumeSeries.length > 0 ? Math.max(...volumeSeries) - Math.min(...volumeSeries) : 0;

  const plateauRisk: DeterministicFlags['plateauRisk'] = range < 400 && recent.length >= 6 ? 'alto' : range < 900 ? 'medio' : 'baixo';
  const fatigueScore = (recovery?.sorenessLevel || 0) + (recovery?.stressLevel || 0) + (avgRpe > 8 ? 2 : avgRpe > 7 ? 1 : 0);
  const deloadNeeded = fatigueScore >= 8 || (recovery?.sleepHours || 8) < 6;
  const adherenceRisk: DeterministicFlags['adherenceRisk'] = completionRate < 0.35 ? 'alto' : completionRate < 0.6 ? 'medio' : 'baixo';
  const recommendedFrequency = Math.max(2, Math.min(6, Math.round(profile.daysPerWeek + (adherenceRisk === 'alto' ? -1 : 0) + (deloadNeeded ? -1 : 0))));

  return { plateauRisk, deloadNeeded, adherenceRisk, recommendedFrequency };
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}


function estimateReps(actualReps?: string): number {
  if (!actualReps) return 0;
  const parsed = Number.parseInt(actualReps, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
