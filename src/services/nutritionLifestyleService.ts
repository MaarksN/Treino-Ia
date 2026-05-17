import { type MacroTargets, type MealEntry, type MenstrualPhase } from '../types';

export type FatigueLevel = 'baixo' | 'moderado' | 'alto';

export interface DynamicNutritionInput {
  goal?: string;
  workoutTime?: string;
  bodyWeightKg?: number;
  fatigue?: number;
  sleepHours?: number;
  stressLevel?: number;
  sorenessLevel?: number;
  hydrationMl?: number;
  hydrationGoalMl?: number;
  menstrualPhase?: MenstrualPhase | null;
}

export interface DynamicNutritionRecommendation {
  fatigueScore: number;
  level: FatigueLevel;
  title: string;
  preWorkout: string;
  hydration: string;
  trainingAdjustment: string;
  mealIdeas: string[];
  flags: string[];
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: 'g' | 'ml' | 'un' | 'colher' | 'dose';
  category: 'proteina' | 'carboidrato' | 'gordura' | 'hortifruti' | 'bebida' | 'tempero';
}

export interface MacroRecipe {
  id: string;
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  tags: string[];
  ingredients: RecipeIngredient[];
}

export interface ShoppingListItem extends RecipeIngredient {
  recipes: string[];
}

export interface RecipeSelection {
  recipes: MacroRecipe[];
  shoppingList: ShoppingListItem[];
  apiQuery: string;
}

export interface LifestyleMacroProfile {
  goal?: string;
  bodyWeightKg?: number;
  trainingDays?: number;
  workoutMinutes?: number;
}

export interface MealScanInsight {
  verdict: 'excelente' | 'bom' | 'ajustar';
  proteinDeltaG: number;
  calorieDelta: number;
  message: string;
  nextAction: string;
}

const DEFAULT_WEIGHT_KG = 75;

const RECIPE_LIBRARY: MacroRecipe[] = [
  {
    id: 'frango-arroz-feijao',
    title: 'Frango, arroz, feijao e salada',
    calories: 620,
    proteinG: 52,
    carbsG: 72,
    fatG: 12,
    tags: ['almoco', 'hipertrofia', 'base'],
    ingredients: [
      { name: 'peito de frango', amount: 180, unit: 'g', category: 'proteina' },
      { name: 'arroz cozido', amount: 160, unit: 'g', category: 'carboidrato' },
      { name: 'feijao', amount: 120, unit: 'g', category: 'carboidrato' },
      { name: 'salada verde', amount: 80, unit: 'g', category: 'hortifruti' },
    ],
  },
  {
    id: 'iogurte-banana-aveia',
    title: 'Iogurte proteico com banana e aveia',
    calories: 430,
    proteinG: 34,
    carbsG: 58,
    fatG: 8,
    tags: ['pre-treino', 'rapido', 'fadiga'],
    ingredients: [
      { name: 'iogurte natural proteico', amount: 250, unit: 'g', category: 'proteina' },
      { name: 'banana', amount: 1, unit: 'un', category: 'hortifruti' },
      { name: 'aveia', amount: 45, unit: 'g', category: 'carboidrato' },
      { name: 'mel', amount: 1, unit: 'colher', category: 'carboidrato' },
    ],
  },
  {
    id: 'omelete-batata-doce',
    title: 'Omelete com batata-doce',
    calories: 540,
    proteinG: 39,
    carbsG: 48,
    fatG: 22,
    tags: ['jantar', 'manutencao', 'saciedade'],
    ingredients: [
      { name: 'ovos', amount: 3, unit: 'un', category: 'proteina' },
      { name: 'claras', amount: 120, unit: 'ml', category: 'proteina' },
      { name: 'batata-doce', amount: 180, unit: 'g', category: 'carboidrato' },
      { name: 'azeite', amount: 1, unit: 'colher', category: 'gordura' },
    ],
  },
  {
    id: 'atum-macarrao-legumes',
    title: 'Macarrao com atum e legumes',
    calories: 690,
    proteinG: 46,
    carbsG: 92,
    fatG: 16,
    tags: ['pos-treino', 'performance', 'mercado'],
    ingredients: [
      { name: 'atum', amount: 1, unit: 'un', category: 'proteina' },
      { name: 'macarrao cozido', amount: 220, unit: 'g', category: 'carboidrato' },
      { name: 'legumes mistos', amount: 140, unit: 'g', category: 'hortifruti' },
      { name: 'molho de tomate', amount: 80, unit: 'g', category: 'tempero' },
    ],
  },
  {
    id: 'tofu-quinoa-graos',
    title: 'Tofu com quinoa e graos',
    calories: 560,
    proteinG: 32,
    carbsG: 62,
    fatG: 20,
    tags: ['vegetariano', 'manutencao', 'micros'],
    ingredients: [
      { name: 'tofu firme', amount: 180, unit: 'g', category: 'proteina' },
      { name: 'quinoa cozida', amount: 160, unit: 'g', category: 'carboidrato' },
      { name: 'grao-de-bico', amount: 90, unit: 'g', category: 'carboidrato' },
      { name: 'brocolis', amount: 120, unit: 'g', category: 'hortifruti' },
    ],
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeGoal(goal = '') {
  return goal.toLocaleLowerCase('pt-BR');
}

export function estimateMacroTargetsForLifestyleProfile(profile: LifestyleMacroProfile): MacroTargets {
  const weight = profile.bodyWeightKg ?? DEFAULT_WEIGHT_KG;
  const goal = normalizeGoal(profile.goal);
  const trainingLoad = (profile.trainingDays ?? 4) * ((profile.workoutMinutes ?? 45) / 45);
  const maintenanceCalories = Math.round(weight * (30 + Math.min(trainingLoad, 6)));
  const calories = goal.includes('emagrec') || goal.includes('cut')
    ? maintenanceCalories - 350
    : goal.includes('hipertrof') || goal.includes('bulk')
      ? maintenanceCalories + 250
      : maintenanceCalories;
  const protein = Math.round(weight * (goal.includes('emagrec') ? 2.3 : 2));
  const fat = Math.round(weight * 0.85);
  const carbs = Math.max(80, Math.round((calories - protein * 4 - fat * 9) / 4));

  return { calories, protein, carbs, fat };
}

export function getDynamicNutritionRecommendation(input: DynamicNutritionInput): DynamicNutritionRecommendation {
  const weight = input.bodyWeightKg ?? DEFAULT_WEIGHT_KG;
  const hydrationRatio = input.hydrationGoalMl
    ? clamp((input.hydrationMl ?? 0) / input.hydrationGoalMl, 0, 1.2)
    : 1;
  const phasePenalty = input.menstrualPhase === 'menstrual'
    ? 14
    : input.menstrualPhase === 'lútea'
      ? 8
      : input.menstrualPhase === 'ovulação'
        ? -4
        : 0;
  const fatigueScore = Math.round(clamp(
    (input.fatigue ?? 2) * 14 +
    (input.sleepHours && input.sleepHours < 6 ? 16 : 0) +
    (input.stressLevel ?? 2) * 7 +
    (input.sorenessLevel ?? 2) * 6 +
    (hydrationRatio < 0.7 ? 14 : hydrationRatio < 0.9 ? 6 : 0) +
    phasePenalty,
    0,
    100,
  ));
  const level: FatigueLevel = fatigueScore >= 65 ? 'alto' : fatigueScore >= 38 ? 'moderado' : 'baixo';
  const workoutTime = input.workoutTime || 'o treino';
  const carbLow = level === 'alto' ? 0.8 : level === 'moderado' ? 0.55 : 0.35;
  const carbHigh = level === 'alto' ? 1.15 : level === 'moderado' ? 0.8 : 0.55;
  const carbRange = `${Math.round(weight * carbLow)}-${Math.round(weight * carbHigh)}g`;
  const flags = [
    ...(input.sleepHours && input.sleepHours < 6 ? ['sono_curto'] : []),
    ...(hydrationRatio < 0.9 ? ['hidratação_baixa'] : []),
    ...(input.stressLevel && input.stressLevel >= 4 ? ['stress_alto'] : []),
    ...(input.sorenessLevel && input.sorenessLevel >= 4 ? ['dor_muscular_alta'] : []),
    ...(input.menstrualPhase === 'menstrual' || input.menstrualPhase === 'lútea' ? [`fase_${input.menstrualPhase}`] : []),
  ];

  return {
    fatigueScore,
    level,
    title: level === 'alto'
      ? 'Pre-treino de resgate'
      : level === 'moderado'
        ? 'Pre-treino com energia controlada'
        : 'Pre-treino leve e eficiente',
    preWorkout: `Use ${carbRange} de carboidrato facil com 20-35g de proteina entre 60 e 120 min antes de ${workoutTime}.`,
    hydration: hydrationRatio < 0.7
      ? 'Entrar no treino com 500-750ml de agua e uma fonte de sodio; cafeina so se o sono estiver em dia.'
      : hydrationRatio < 0.9
        ? 'Completar 300-500ml antes do aquecimento e manter pequenos goles no treino.'
        : 'Hidratacao adequada; manter agua por perto e ajustar se houver muito suor.',
    trainingAdjustment: level === 'alto'
      ? 'Reduzir intensidade planejada em 10-20% ou priorizar tecnica se a fadiga persistir no aquecimento.'
      : input.menstrualPhase === 'menstrual'
        ? 'Priorizar mobilidade, zonas leves e cargas submaximas hoje.'
        : input.menstrualPhase === 'ovulação'
          ? 'Boa janela para intensidade, mantendo aquecimento caprichado e tecnica limpa.'
          : 'Manter plano, mas reavaliar RPE no primeiro exercicio composto.',
    mealIdeas: level === 'alto'
      ? ['banana com aveia e whey', 'arroz branco com ovos', 'iogurte proteico com mel']
      : level === 'moderado'
        ? ['pao ou tapioca com ovos', 'fruta com iogurte', 'batata-doce com frango']
        : ['fruta e whey', 'cafe da manha normal', 'lanche leve com proteina'],
    flags,
  };
}

export function buildRecipeApiQuery(targets: MacroTargets, mealsPerDay = 3): string {
  const mealCalories = Math.round(targets.calories / mealsPerDay);
  const mealProtein = Math.round(targets.protein / mealsPerDay);
  const params = new URLSearchParams({
    minProtein: String(Math.max(20, mealProtein - 8)),
    maxCalories: String(mealCalories + 180),
    minCalories: String(Math.max(250, mealCalories - 180)),
    diet: 'balanced',
    language: 'pt-BR',
  });

  return params.toString();
}

export function selectRecipesForMacroTargets(
  targets: MacroTargets,
  options: { maxRecipes?: number; preferTags?: string[] } = {},
): RecipeSelection {
  const maxRecipes = options.maxRecipes ?? 3;
  const mealTarget = {
    calories: targets.calories / 3,
    proteinG: targets.protein / 3,
    carbsG: targets.carbs / 3,
    fatG: targets.fat / 3,
  };
  const preferTags = options.preferTags ?? [];
  const recipes = [...RECIPE_LIBRARY]
    .map(recipe => {
      const distance =
        Math.abs(recipe.calories - mealTarget.calories) / 12 +
        Math.abs(recipe.proteinG - mealTarget.proteinG) * 1.5 +
        Math.abs(recipe.carbsG - mealTarget.carbsG) * 0.6 +
        Math.abs(recipe.fatG - mealTarget.fatG) * 0.8;
      const tagBonus = preferTags.filter(tag => recipe.tags.includes(tag)).length * 12;
      return { recipe, score: distance - tagBonus };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, maxRecipes)
    .map(item => item.recipe);

  return {
    recipes,
    shoppingList: buildShoppingList(recipes),
    apiQuery: buildRecipeApiQuery(targets),
  };
}

export function buildShoppingList(recipes: MacroRecipe[], servingsPerRecipe = 2): ShoppingListItem[] {
  const grouped = new Map<string, ShoppingListItem>();

  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      const key = `${ingredient.name}:${ingredient.unit}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.amount += ingredient.amount * servingsPerRecipe;
        existing.recipes = Array.from(new Set([...existing.recipes, recipe.title]));
        return;
      }

      grouped.set(key, {
        ...ingredient,
        amount: ingredient.amount * servingsPerRecipe,
        recipes: [recipe.title],
      });
    });
  });

  return [...grouped.values()].sort((a, b) => (
    a.category === b.category ? a.name.localeCompare(b.name, 'pt-BR') : a.category.localeCompare(b.category, 'pt-BR')
  ));
}

export function summarizeMealScanForTargets(meal: Partial<MealEntry>, targets: MacroTargets): MealScanInsight {
  const mealProteinTarget = Math.round(targets.protein / 4);
  const mealCalorieTarget = Math.round(targets.calories / 4);
  const protein = meal.estimatedProtein ?? 0;
  const calories = meal.estimatedCalories ?? 0;
  const proteinDeltaG = protein - mealProteinTarget;
  const calorieDelta = calories - mealCalorieTarget;
  const verdict: MealScanInsight['verdict'] = proteinDeltaG >= -5 && Math.abs(calorieDelta) <= 180
    ? 'excelente'
    : proteinDeltaG >= -12 && Math.abs(calorieDelta) <= 300
      ? 'bom'
      : 'ajustar';

  return {
    verdict,
    proteinDeltaG,
    calorieDelta,
    message: verdict === 'excelente'
      ? 'Refeicao bem alinhada com as metas do dia.'
      : verdict === 'bom'
        ? 'Refeicao utilizavel, com um ajuste pequeno para bater o alvo.'
        : 'Refeicao fora do alvo; vale ajustar antes de repetir como padrao.',
    nextAction: proteinDeltaG < -8
      ? `Adicionar cerca de ${Math.abs(proteinDeltaG)}g de proteina.`
      : calorieDelta > 250
        ? 'Reduzir uma fonte de gordura ou carboidrato na proxima refeicao.'
        : calorieDelta < -250
          ? 'Adicionar carboidrato facil se o treino ainda vai acontecer.'
          : 'Manter agua e registrar saciedade para calibrar a proxima sugestao.',
  };
}
