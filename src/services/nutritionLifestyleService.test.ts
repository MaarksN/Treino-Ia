import { describe, expect, it } from 'vitest';
import {
  estimateMacroTargetsForLifestyleProfile,
  getDynamicNutritionRecommendation,
  selectRecipesForMacroTargets,
  summarizeMealScanForTargets,
} from './nutritionLifestyleService';

describe('nutritionLifestyleService', () => {
  it('raises dynamic pre-workout support when fatigue and hydration risk are high', () => {
    const recommendation = getDynamicNutritionRecommendation({
      bodyWeightKg: 80,
      fatigue: 5,
      sleepHours: 5.5,
      stressLevel: 4,
      sorenessLevel: 4,
      hydrationMl: 900,
      hydrationGoalMl: 3000,
      menstrualPhase: 'lútea',
      workoutTime: '18:30',
    });

    expect(recommendation.level).toBe('alto');
    expect(recommendation.flags).toContain('sono_curto');
    expect(recommendation.flags).toContain('hidratação_baixa');
    expect(recommendation.preWorkout).toContain('18:30');
    expect(recommendation.trainingAdjustment).toContain('10-20%');
  });

  it('selects recipes and aggregates a shopping list from macro targets', () => {
    const targets = estimateMacroTargetsForLifestyleProfile({
      goal: 'Hipertrofia',
      bodyWeightKg: 78,
      trainingDays: 5,
      workoutMinutes: 60,
    });
    const selection = selectRecipesForMacroTargets(targets, { maxRecipes: 3, preferTags: ['pre-treino'] });

    expect(selection.recipes).toHaveLength(3);
    expect(selection.apiQuery).toContain('minProtein=');
    expect(selection.shoppingList.length).toBeGreaterThan(6);
    expect(selection.shoppingList.every(item => item.amount > 0)).toBe(true);
  });

  it('turns meal scan macros into an actionable next step', () => {
    const insight = summarizeMealScanForTargets(
      {
        description: 'Prato de massa simples',
        estimatedCalories: 820,
        estimatedProtein: 18,
      },
      { calories: 2600, protein: 180, carbs: 300, fat: 75 },
    );

    expect(insight.verdict).toBe('ajustar');
    expect(insight.nextAction).toContain('proteina');
  });
});
