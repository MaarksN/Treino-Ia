import { MacroPlan, NutritionScore } from '../types/nutrition';

export function scoreNutritionDay(
  targets: MacroPlan,
  consumed: Pick<MacroPlan, 'calories' | 'proteinG' | 'carbsG' | 'fatG' | 'waterMl'>,
): NutritionScore {
  const calorieDelta = Math.abs(consumed.calories - targets.calories) / Math.max(1, targets.calories);
  const proteinDelta = Math.abs(consumed.proteinG - targets.proteinG) / Math.max(1, targets.proteinG);
  const waterDelta = consumed.waterMl >= targets.waterMl ? 0 : (targets.waterMl - consumed.waterMl) / targets.waterMl;
  const raw = 100 - calorieDelta * 35 - proteinDelta * 35 - waterDelta * 20;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  if (score >= 90) return { score, grade: 'A', tip: 'Dia muito alinhado. Mantenha a rotina.' };
  if (score >= 80) return { score, grade: 'B', tip: 'Bom dia. Ajuste pequenos desvios de macros.' };
  if (score >= 70) return { score, grade: 'C', tip: 'Aumente aderencia em proteina e hidratacao.' };
  if (score >= 60) return { score, grade: 'D', tip: 'Planeje refeicoes rapidas para evitar buracos.' };
  if (score >= 50) return { score, grade: 'E', tip: 'Reforce o basico: proteina, agua e calorias.' };
  return { score, grade: 'F', tip: 'Dia fora da meta. Recomece pela proxima refeicao.' };
}
