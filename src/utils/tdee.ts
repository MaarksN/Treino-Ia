import { NutritionProfile } from '../types/nutrition';
import { UserProfile } from '../types';

export function calculateBmr(profile: NutritionProfile): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  const gender = profile.gender.toLowerCase();
  return Math.round(base + (gender.includes('masc') || gender === 'male' ? 5 : -161));
}

export function activityMultiplier(workoutsPerWeek: number): number {
  if (workoutsPerWeek >= 6) return 1.725;
  if (workoutsPerWeek >= 4) return 1.55;
  if (workoutsPerWeek >= 2) return 1.375;
  return 1.2;
}

export function calculateTdee(profile: NutritionProfile): number {
  return Math.round(calculateBmr(profile) * activityMultiplier(profile.workoutsPerWeek));
}

export function nutritionProfileFromUser(profile: UserProfile): NutritionProfile {
  const goal = profile.goal.toLowerCase();

  return {
    age: profile.age,
    gender: profile.gender,
    weightKg: profile.weight,
    heightCm: profile.height,
    workoutsPerWeek: profile.daysPerWeek,
    goal: goal.includes('emag') || goal.includes('cut') ? 'cutting' : goal.includes('hiper') ? 'bulking' : 'maintenance',
  };
}
