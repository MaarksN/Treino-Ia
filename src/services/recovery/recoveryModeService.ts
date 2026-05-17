import { type WorkoutSession } from '../database';
import { calculateRpeLoad } from './rpeLoadService';
import { type PainCheckinRecord } from './painCheckinService';
import { type CaffeineEntry, estimateCaffeineImpact } from './caffeineImpactService';

export function buildRecoveryRecommendations(input: { history: WorkoutSession[]; pain: PainCheckinRecord; caffeine: CaffeineEntry[]; sleepCorrelation: number }): string[] {
  const tips = ['Mobilidade leve por 10-15 min.', 'Caminhada leve de 20-30 min.', 'Hidratação consistente ao longo do dia.'];
  const load = calculateRpeLoad(input.history);
  const painPeak = Math.max(...Object.values(input.pain.pain));
  const caffeine = estimateCaffeineImpact(input.caffeine);

  if (load.level === 'alta' || load.level === 'muito alta') tips.push('Alongamento e respiração para baixar a intensidade do dia.');
  if (painPeak >= 6) tips.push('Foque em amplitude confortável e reduza esforço em regiões doloridas.');
  if (caffeine.nearSleepMg >= 120) tips.push('Evite cafeína nas próximas horas para proteger seu sono.');
  if (input.sleepCorrelation < -0.2) tips.push('Sono ruim coincidiu com queda de performance. Priorize 7-9h hoje.');
  else tips.push('Mantenha rotina de sono para sustentar sua prontidão.');

  return tips;
}
