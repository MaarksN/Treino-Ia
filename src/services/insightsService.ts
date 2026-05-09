import { WeeklyInsight, WorkoutSession } from '../types';
import { detectHighFatigue, getMissedDaysRisk } from '../utils/personalization';

export function generateLocalWeeklyInsights(sessions: WorkoutSession[]): WeeklyInsight[] {
  const recent = sessions.slice(-7);
  const insights: WeeklyInsight[] = [];

  if (recent.length >= 3) {
    insights.push({
      title: 'Boa consistência',
      description: `${recent.length} sessões recentes registradas para alimentar a IA.`,
      severity: 'good',
    });
  } else {
    insights.push({
      title: 'Poucos dados de sessão',
      description: 'Salve sessões concluídas para melhorar progressão, deload e predição de platô.',
      severity: 'info',
    });
  }

  if (detectHighFatigue(sessions)) {
    insights.push({
      title: 'Fadiga alta',
      description: 'Há sinais recentes de RPE muito alto ou dor. Vale considerar redução de volume.',
      severity: 'warning',
    });
  }

  const risk = getMissedDaysRisk(sessions);
  if (risk !== 'baixo') {
    insights.push({
      title: 'Risco de inconsistência',
      description: `Risco ${risk} por intervalo desde a última sessão registrada.`,
      severity: risk === 'alto' ? 'critical' : 'warning',
    });
  }

  return insights;
}
