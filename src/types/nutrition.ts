export type NutritionGoal = 'cutting' | 'maintenance' | 'bulking' | 'performance';

export interface NutritionProfile {
  age: number;
  gender: string;
  weightKg: number;
  heightCm: number;
  workoutsPerWeek: number;
  goal: NutritionGoal;
}

export interface MacroPlan {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
}

export interface FoodItem {
  id: string;
  name: string;
  serving: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  source: 'TACO' | 'USDA' | 'manual';
}

export interface NutritionScore {
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  score: number;
  tip: string;
}
