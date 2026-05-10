import { WellnessEntry } from '../types/recovery';

export function detectOvertrainingRisk(entries: WellnessEntry[]) {
  const recent = entries.slice(-7);
  if (recent.length < 3) return { risk: 'baixo' as const, reason: 'Poucos dados recentes.' };

  const avgStress = recent.reduce((sum, item) => sum + item.stress, 0) / recent.length;
  const avgEnergy = recent.reduce((sum, item) => sum + item.energy, 0) / recent.length;
  const avgSoreness = recent.reduce((sum, item) => sum + item.soreness, 0) / recent.length;

  if (avgStress >= 4 && avgEnergy <= 2.5 && avgSoreness >= 4) {
    return { risk: 'alto' as const, reason: 'Estresse alto, energia baixa e dor muscular persistente.' };
  }

  if (avgStress >= 3.5 || avgEnergy <= 3 || avgSoreness >= 3.5) {
    return { risk: 'medio' as const, reason: 'Sinais moderados de fadiga acumulada.' };
  }

  return { risk: 'baixo' as const, reason: 'Marcadores recentes estaveis.' };
}
