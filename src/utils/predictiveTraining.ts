import { PlateauSignal, PredictivePrForecast } from '../types/ai';

export function detectPlateau(exercise: string, recentLoads: number[]): PlateauSignal {
  const last = recentLoads.slice(-4);
  const spread = Math.max(...last) - Math.min(...last);

  if (last.length >= 4 && spread <= 2.5) {
    return {
      exercise,
      risk: 'alto',
      reason: 'Carga praticamente estavel nas ultimas 4 sessoes.',
      action: 'Trocar faixa de reps, adicionar deload curto ou variar estimulo.',
    };
  }

  if (last.length >= 3 && spread <= 5) {
    return {
      exercise,
      risk: 'medio',
      reason: 'Progressao lenta nas ultimas sessoes.',
      action: 'Aumentar 1 serie tecnica ou microcarga.',
    };
  }

  return {
    exercise,
    risk: 'baixo',
    reason: 'Ainda ha progressao suficiente.',
    action: 'Manter progressao planejada.',
  };
}

export function forecastPr(exercise: string, currentBestKg: number, targetKg: number): PredictivePrForecast {
  const delta = Math.max(0, targetKg - currentBestKg);
  const estimatedWeeks = Math.max(1, Math.ceil(delta / Math.max(1, currentBestKg * 0.025)));

  return {
    exercise,
    currentBestKg,
    targetKg,
    estimatedWeeks,
    confidence: Math.max(45, Math.min(90, 90 - estimatedWeeks * 3)),
  };
}
