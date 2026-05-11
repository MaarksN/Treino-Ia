import { describe, expect, it } from 'vitest';
import { buildWeeklyNutritionAdherence, validateMealInput, validateSupplementInput } from './nutritionTrackingService';

describe('nutritionTrackingService', () => {
  it('validates meal input and sanitizes unsafe text', () => {
    const meal = validateMealInput({
      mealType: 'Almoço',
      description: '<script>frango</script> arroz',
      estimatedCalories: 650,
      estimatedProtein: 42,
    });

    expect(meal.description).not.toContain('<');
    expect(meal.estimatedCalories).toBe(650);
  });

  it('rejects empty supplement names', () => {
    expect(() => validateSupplementInput({ name: ' ' })).toThrow('nome do suplemento');
  });

  it('builds weekly adherence from real meal totals', () => {
    const today = new Date('2026-05-10T12:00:00Z');
    const result = buildWeeklyNutritionAdherence([
      {
        id: 'm1',
        date: '2026-05-10',
        mealType: 'Almoço',
        description: 'Plano perfeito',
        estimatedCalories: 2000,
        estimatedProtein: 160,
        estimatedCarbs: 220,
        estimatedFat: 70,
      },
      {
        id: 'm2',
        date: '2026-05-09',
        mealType: 'Jantar',
        description: 'Dia parcial',
        estimatedCalories: 1000,
        estimatedProtein: 80,
        estimatedCarbs: 110,
        estimatedFat: 35,
      },
    ], {
      calories: 2000,
      protein: 160,
      carbs: 220,
      fat: 70,
    }, today);

    expect(result.days).toHaveLength(7);
    expect(result.averageAdherence).toBeGreaterThan(60);
    expect(result.bestDay?.date).toBe('2026-05-10');
  });
});
