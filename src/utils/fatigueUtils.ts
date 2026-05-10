import {
  FatigueSnapshot,
  IntensitySemaphore,
  SessionReadiness,
} from '../types';

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function calcFatigueScore(input: Omit<FatigueSnapshot, 'fatigueScore'>): number {
  const readinessPenalty = 100 - input.readiness;
  const sorenessWeight = input.soreness * 8;
  const sleepPenalty = (10 - input.sleep) * 6;
  const stressWeight = input.stress * 7;
  const hrvPenalty = input.hrv ? Math.max(0, 70 - input.hrv) : 0;
  const volumePenalty = input.weeklyVolume ? Math.min(20, input.weeklyVolume / 10) : 0;
  const missedPenalty = input.missedSessions ? input.missedSessions * 3 : 0;

  const raw =
    readinessPenalty * 0.3 +
    sorenessWeight * 0.2 +
    sleepPenalty * 0.18 +
    stressWeight * 0.18 +
    hrvPenalty * 0.08 +
    volumePenalty * 0.04 +
    missedPenalty * 0.02;

  return Math.round(clamp(raw));
}

export function getRecoveryIndex(fatigueScore: number): number {
  return Math.round(clamp(100 - fatigueScore));
}

export function getFatigueTrafficLight(score: number): {
  semaphore: IntensitySemaphore;
  label: string;
  className: string;
} {
  if (score < 35) {
    return {
      semaphore: 'green',
      label: 'Baixa fadiga',
      className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    };
  }

  if (score < 65) {
    return {
      semaphore: 'yellow',
      label: 'Fadiga moderada',
      className: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    };
  }

  return {
    semaphore: 'red',
    label: 'Alta fadiga',
    className: 'bg-red-500/10 text-red-300 border-red-500/30',
  };
}

export function shouldAutoDeload(snapshot: FatigueSnapshot): boolean {
  const fatigueScore = snapshot.fatigueScore ?? calcFatigueScore(snapshot);

  return (
    fatigueScore >= 72 ||
    snapshot.readiness <= 35 ||
    snapshot.soreness >= 8 ||
    snapshot.sleep <= 4
  );
}

export function suggestExtraRestHours(snapshot: FatigueSnapshot): number {
  const fatigueScore = snapshot.fatigueScore ?? calcFatigueScore(snapshot);

  if (fatigueScore >= 80) return 48;
  if (fatigueScore >= 65) return 24;
  if (fatigueScore >= 50) return 12;
  return 0;
}

export function getSessionReadiness(snapshot: FatigueSnapshot): SessionReadiness {
  const fatigueScore = snapshot.fatigueScore ?? calcFatigueScore(snapshot);
  const recoveryIndex = getRecoveryIndex(fatigueScore);
  const traffic = getFatigueTrafficLight(fatigueScore);

  if (traffic.semaphore === 'red') {
    return {
      readinessScore: snapshot.readiness,
      fatigueScore,
      recoveryIndex,
      semaphore: traffic.semaphore,
      recommendation:
        'Reduza carga e volume hoje. Considere deload, mobilidade ou descanso ativo.',
    };
  }

  if (traffic.semaphore === 'yellow') {
    return {
      readinessScore: snapshot.readiness,
      fatigueScore,
      recoveryIndex,
      semaphore: traffic.semaphore,
      recommendation:
        'Treine com cautela. Mantenha técnica, evite falha e reduza 10-20% do volume.',
    };
  }

  return {
    readinessScore: snapshot.readiness,
    fatigueScore,
    recoveryIndex,
    semaphore: traffic.semaphore,
    recommendation:
      'Boa prontidão. Pode seguir o plano e aplicar progressão se a execução estiver sólida.',
  };
}
