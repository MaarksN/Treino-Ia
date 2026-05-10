import { MacroPlan, NutritionProfile } from '../types/nutrition';
import { calculateTdee } from './tdee';

export function calculateMacroPlan(profile: NutritionProfile): MacroPlan {
  const tdee = calculateTdee(profile);
  const calories =
    profile.goal === 'cutting'
      ? tdee - 400
      : profile.goal === 'bulking'
        ? tdee + 300
        : tdee;

  const proteinG = Math.round(profile.weightKg * (profile.goal === 'cutting' ? 2.4 : 2.1));
  const fatG = Math.round(profile.weightKg * 0.9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));

  return {
    calories,
    proteinG,
    carbsG,
    fatG,
    waterMl: Math.round(profile.weightKg * 35),
  };
}

export function macroCalories(plan: Pick<MacroPlan, 'proteinG' | 'carbsG' | 'fatG'>) {
  return plan.proteinG * 4 + plan.carbsG * 4 + plan.fatG * 9;
}
