import { RecoveryScoreResult, WellnessEntry } from '../types/recovery';

export function calculateRecoveryScore(entry: WellnessEntry): RecoveryScoreResult {
  const sleepScore = Math.min(100, Math.round(((entry.energy + entry.mood) / 10) * 40 + (6 - entry.stress) * 8));
  const sorenessPenalty = entry.soreness * 6;
  const rpePenalty = (entry.sessionRpe ?? 5) * 2;
  const hrvBonus = entry.hrv ? Math.min(10, Math.max(-10, (entry.hrv - 55) / 3)) : 0;
  const score = Math.max(0, Math.min(100, Math.round(sleepScore + 35 - sorenessPenalty - rpePenalty + hrvBonus)));

  if (score >= 82) return { score, label: 'pronto', recommendation: 'Treino completo liberado. Progrida com tecnica.' };
  if (score >= 68) return { score, label: 'moderado', recommendation: 'Treine, mas mantenha 1-2 reps na reserva.' };
  if (score >= 50) return { score, label: 'cautela', recommendation: 'Reduza volume e evite falha muscular.' };
  return { score, label: 'descanso', recommendation: 'Priorize recuperacao ativa, sono e mobilidade.' };
}
