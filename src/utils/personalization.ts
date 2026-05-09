import { RecoveryCheckin, WorkoutSession } from '../types';

export function calculateReadiness(checkin: RecoveryCheckin) {
  const sleepScore = Math.min(checkin.sleepHours, 8) * 10;
  const energyScore = checkin.energyLevel * 6;
  const stressPenalty = checkin.stressLevel * 5;
  const sorenessPenalty = checkin.sorenessLevel * 4;
  const score = Math.max(0, Math.round(sleepScore + energyScore - stressPenalty - sorenessPenalty));

  if (score >= 60) return { score, label: 'Alta' };
  if (score >= 35) return { score, label: 'Média' };
  return { score, label: 'Baixa' };
}

export function detectPlateauHeuristic(sessions: WorkoutSession[], exerciseName: string) {
  const entries = sessions
    .flatMap(session => session.logs)
    .filter(log => log.exerciseName.toLowerCase() === exerciseName.toLowerCase() && log.actualWeight)
    .slice(-4);

  if (entries.length < 3) return false;

  const weights = entries.map(entry => entry.actualWeight || 0);
  return Math.max(...weights) - Math.min(...weights) <= 1;
}

export function detectHighFatigue(sessions: WorkoutSession[]) {
  const recent = sessions.slice(-5);
  const highRpeCount = recent.flatMap(session => session.logs).filter(log => (log.rpe || 0) >= 9).length;
  const painCount = recent.flatMap(session => session.logs).filter(log => log.feedback === 'painful').length;

  return highRpeCount >= 4 || painCount >= 1;
}

export function getMissedDaysRisk(sessions: WorkoutSession[]) {
  if (sessions.length < 2) return 'baixo';

  const last = sessions[sessions.length - 1]?.completedAt;
  const diffDays = Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));

  if (diffDays >= 7) return 'alto';
  if (diffDays >= 4) return 'médio';
  return 'baixo';
}
