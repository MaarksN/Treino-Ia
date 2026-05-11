import { RecoveryCheckin, UserProfile, WorkoutSession } from '../types';

export interface DeterministicFlags {
  plateauRisk: 'baixo' | 'medio' | 'alto';
  deloadNeeded: boolean;
  adherenceRisk: 'baixo' | 'medio' | 'alto';
  recommendedFrequency: number;
  lowRecovery: boolean;
  highFatigue: boolean;
  painOrLimitation: boolean;
  poorSleepOrStress: boolean;
}

export interface DayVariationGuardrailInput {
  availableMinutes: number;
  recovery?: RecoveryCheckin;
  equipment?: string;
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
  const lowRecovery = Boolean(recovery && (recovery.energyLevel <= 4 || recovery.sleepHours < 6));
  const highFatigue = fatigueScore >= 8 || avgRpe >= 9;
  const poorSleepOrStress = Boolean(recovery && (recovery.sleepHours < 6 || recovery.stressLevel >= 8));
  const painOrLimitation = hasPainOrLimitation(profile, recent);
  const deloadNeeded = highFatigue || lowRecovery || poorSleepOrStress;
  const adherenceRisk: DeterministicFlags['adherenceRisk'] = completionRate < 0.35 ? 'alto' : completionRate < 0.6 ? 'medio' : 'baixo';
  const recommendedFrequency = Math.max(2, Math.min(6, Math.round(profile.daysPerWeek + (adherenceRisk === 'alto' ? -1 : 0) + (deloadNeeded ? -1 : 0))));

  return {
    plateauRisk,
    deloadNeeded,
    adherenceRisk,
    recommendedFrequency,
    lowRecovery,
    highFatigue,
    painOrLimitation,
    poorSleepOrStress,
  };
}

export function listDeterministicFlagLabels(flags: DeterministicFlags): string[] {
  const labels: string[] = [];
  if (flags.plateauRisk === 'alto') labels.push('plateau_detected');
  if (flags.deloadNeeded) labels.push('deload_needed');
  if (flags.adherenceRisk === 'alto') labels.push('high_abandonment_risk');
  if (flags.lowRecovery) labels.push('low_recovery_reduce_volume_intensity');
  if (flags.highFatigue) labels.push('high_fatigue_force_deload');
  if (flags.painOrLimitation) labels.push('pain_or_limitation_safe_swap');
  if (flags.poorSleepOrStress) labels.push('poor_sleep_or_stress_reduce_aggressiveness');
  return labels;
}

export function enforceTrainingGuardrails<T extends {
  volumeAdjustment?: 'increase' | 'maintain' | 'reduce';
  intensityAdjustment?: 'increase' | 'maintain' | 'reduce';
  safetyNotes?: string[];
  summary?: string;
}>(value: T, flags: DeterministicFlags): T {
  const next = { ...value };
  const notes = [...(value.safetyNotes || [])];

  if (flags.lowRecovery || flags.poorSleepOrStress) {
    next.volumeAdjustment = 'reduce';
    next.intensityAdjustment = 'reduce';
    notes.push('Recuperação baixa: reduzir volume e intensidade hoje.');
  }

  if (flags.highFatigue || flags.deloadNeeded) {
    next.volumeAdjustment = 'reduce';
    next.intensityAdjustment = 'reduce';
    notes.push('Fadiga alta: priorizar deload ou sessão regenerativa.');
  }

  if (flags.painOrLimitation) {
    notes.push('Dor ou limitação: substituir exercícios que agravem a região afetada.');
  }

  next.safetyNotes = Array.from(new Set(notes));
  return next;
}

export function buildDayVariationGuardrails(input: DayVariationGuardrailInput) {
  const availableMinutes = validateAvailableMinutes(input.availableMinutes);
  const lowRecovery = Boolean(input.recovery && (input.recovery.energyLevel <= 4 || input.recovery.sleepHours < 6));
  const equipment = (input.equipment || 'peso corporal')
    .split(/[,;/]/)
    .map(item => item.trim())
    .filter(Boolean);

  return {
    availableMinutes,
    equipment: equipment.length ? equipment : ['peso corporal'],
    volumeAdjustment: availableMinutes < 35 || lowRecovery ? 'reduce' as const : 'maintain' as const,
    intensityAdjustment: lowRecovery ? 'reduce' as const : 'maintain' as const,
    safetyNotes: [
      ...(availableMinutes < 35 ? ['Tempo reduzido: usar menos exercícios e descansos controlados.'] : []),
      ...(lowRecovery ? ['Recuperação baixa: evitar séries até a falha.'] : []),
    ],
  };
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hasPainOrLimitation(profile: UserProfile, sessions: WorkoutSession[]): boolean {
  const injuryText = `${profile.injuries || ''}`.toLowerCase();
  const hasKnownLimitation = injuryText.trim().length > 0 && !['nenhuma', 'não', 'nao', 'sem'].includes(injuryText.trim());
  const hasPainFeedback = sessions.some(session => session.logs.some(log => log.feedback === 'painful'));
  return hasKnownLimitation || hasPainFeedback;
}

function estimateReps(actualReps?: string): number {
  if (!actualReps) return 0;
  const parsed = Number.parseInt(actualReps, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
