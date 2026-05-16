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

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEntry {
  id: string;
  date: string;
  mealType: 'Café da manhã' | 'Almoço' | 'Jantar' | 'Lanche' | 'Pré-treino' | 'Pós-treino';
  description: string;
  estimatedCalories?: number;
  estimatedProtein?: number;
  estimatedCarbs?: number;
  estimatedFat?: number;
  photoBase64?: string;
  aiAnalysis?: string;
}

export interface FavoriteFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SupplementEntry {
  id: string;
  name: string;
  dose: string;
  timing: string;
  date?: string;
  taken?: boolean;
  notes?: string;
}

export interface NutritionWeekSummary {
  avgCalories: number;
  avgProtein: number;
  adherencePercent: number;
  bestDay: string;
  worstDay: string;
}
