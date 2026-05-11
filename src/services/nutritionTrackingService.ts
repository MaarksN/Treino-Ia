import { FavoriteFood, MacroTargets, MealEntry, SupplementEntry } from '../types';
import { DataMode, PersistResult } from '../types/trainingExecution';
import { sanitizeText } from '../utils/inputSanitizer';
import { logAuditEvent } from './auditLogService';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const DEV_KEYS = {
  meals: '@TreinoApp:meals:mock_dev_only',
  macros: '@TreinoApp:macros:mock_dev_only',
  supplements: '@TreinoApp:supplements:mock_dev_only',
  favoriteFoods: '@TreinoApp:favFoods:mock_dev_only',
};

const LEGACY_KEYS = {
  meals: '@TreinoApp:meals',
  macros: '@TreinoApp:macros',
  supplements: '@TreinoApp:supplements',
  favoriteFoods: '@TreinoApp:favFoods',
};

export interface NutritionTrackingState extends PersistResult {
  meals: MealEntry[];
  macros: MacroTargets | null;
  supplements: SupplementEntry[];
  favoriteFoods: FavoriteFood[];
}

export interface WeeklyNutritionDay {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  adherence: number;
}

export interface WeeklyNutritionAdherence {
  averageAdherence: number;
  bestDay?: WeeklyNutritionDay;
  worstDay?: WeeklyNutritionDay;
  days: WeeklyNutritionDay[];
  summary: string;
}

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readJSON<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function readDevJSON<T>(key: keyof typeof DEV_KEYS, fallback: T): T {
  const current = readJSON<T>(DEV_KEYS[key], fallback);
  if (Array.isArray(current) && current.length === 0) return readJSON<T>(LEGACY_KEYS[key], fallback);
  if (!Array.isArray(current) && current === null) return readJSON<T>(LEGACY_KEYS[key], fallback);
  return current;
}

function writeJSON<T>(key: string, value: T) {
  if (canUseStorage()) window.localStorage.setItem(key, JSON.stringify(value));
}

async function getAuthUserId() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) return null;
  return data.user.id;
}

function devState(warning?: string): NutritionTrackingState {
  return {
    dataMode: 'mock_dev_only',
    warning: warning || 'Supabase não configurado ou usuário não autenticado; dados nutricionais estão em modo local de desenvolvimento.',
    meals: readDevJSON<MealEntry[]>('meals', []),
    macros: readDevJSON<MacroTargets | null>('macros', null),
    supplements: readDevJSON<SupplementEntry[]>('supplements', []),
    favoriteFoods: readDevJSON<FavoriteFood[]>('favoriteFoods', []),
  };
}

function ensurePositiveInteger(value: unknown, label: string, max = 20000) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > max) {
    throw new Error(`${label} inválido.`);
  }
  return Math.round(parsed);
}

export function validateMacroTargets(input: MacroTargets): MacroTargets {
  return {
    calories: ensurePositiveInteger(input.calories, 'Calorias', 12000),
    protein: ensurePositiveInteger(input.protein, 'Proteína', 1000),
    carbs: ensurePositiveInteger(input.carbs, 'Carboidratos', 2000),
    fat: ensurePositiveInteger(input.fat, 'Gorduras', 1000),
  };
}

export function validateMealInput(input: Partial<MealEntry>): MealEntry {
  const description = sanitizeText(input.description || '');
  if (description.length < 2) throw new Error('Descreva a refeição antes de registrar.');

  return {
    id: input.id || crypto.randomUUID(),
    date: input.date || new Date().toISOString().slice(0, 10),
    mealType: input.mealType || 'Almoço',
    description,
    estimatedCalories: input.estimatedCalories === undefined ? undefined : ensurePositiveInteger(input.estimatedCalories, 'Calorias', 8000),
    estimatedProtein: input.estimatedProtein === undefined ? undefined : ensurePositiveInteger(input.estimatedProtein, 'Proteína', 400),
    estimatedCarbs: input.estimatedCarbs === undefined ? undefined : ensurePositiveInteger(input.estimatedCarbs, 'Carboidratos', 800),
    estimatedFat: input.estimatedFat === undefined ? undefined : ensurePositiveInteger(input.estimatedFat, 'Gorduras', 400),
    photoBase64: input.photoBase64,
    aiAnalysis: input.aiAnalysis ? sanitizeText(input.aiAnalysis) : undefined,
  };
}

export function validateSupplementInput(input: Partial<SupplementEntry>): SupplementEntry {
  const name = sanitizeText(input.name || '');
  if (name.length < 2) throw new Error('Informe o nome do suplemento.');

  return {
    id: input.id || crypto.randomUUID(),
    name,
    dose: sanitizeText(input.dose || ''),
    timing: sanitizeText(input.timing || ''),
    date: input.date || new Date().toISOString().slice(0, 10),
    taken: input.taken ?? true,
    notes: input.notes ? sanitizeText(input.notes) : undefined,
  };
}

export function validateFavoriteFoodInput(input: Partial<FavoriteFood>): FavoriteFood {
  const name = sanitizeText(input.name || '');
  if (name.length < 2) throw new Error('Informe o alimento favorito.');

  return {
    id: input.id || crypto.randomUUID(),
    name,
    calories: ensurePositiveInteger(input.calories, 'Calorias', 8000),
    protein: ensurePositiveInteger(input.protein, 'Proteína', 400),
    carbs: ensurePositiveInteger(input.carbs, 'Carboidratos', 800),
    fat: ensurePositiveInteger(input.fat, 'Gorduras', 400),
  };
}

function mapMeal(row: any): MealEntry {
  return {
    id: row.id,
    date: row.meal_date,
    mealType: row.meal_type,
    description: row.description,
    estimatedCalories: row.estimated_calories ?? undefined,
    estimatedProtein: row.estimated_protein ?? undefined,
    estimatedCarbs: row.estimated_carbs ?? undefined,
    estimatedFat: row.estimated_fat ?? undefined,
    aiAnalysis: row.ai_analysis ?? undefined,
  };
}

function mapSupplement(row: any): SupplementEntry {
  return {
    id: row.id,
    name: row.name,
    dose: row.dose,
    timing: row.timing,
    date: row.supplement_date,
    taken: row.taken,
    notes: row.notes ?? undefined,
  };
}

function mapFavoriteFood(row: any): FavoriteFood {
  return {
    id: row.id,
    name: row.name,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
  };
}

function persistDevState(state: Partial<Omit<NutritionTrackingState, 'dataMode'>>) {
  if (state.meals) writeJSON(DEV_KEYS.meals, state.meals);
  if ('macros' in state) writeJSON(DEV_KEYS.macros, state.macros ?? null);
  if (state.supplements) writeJSON(DEV_KEYS.supplements, state.supplements);
  if (state.favoriteFoods) writeJSON(DEV_KEYS.favoriteFoods, state.favoriteFoods);
}

export async function loadNutritionTrackingState(): Promise<NutritionTrackingState> {
  const userId = await getAuthUserId();
  if (!userId) return devState();

  const [macroResult, mealsResult, supplementsResult, favoritesResult] = await Promise.all([
    supabase.from('nutrition_macro_targets').select('calories, protein, carbs, fat').eq('user_id', userId).maybeSingle(),
    supabase.from('nutrition_meals').select('*').eq('user_id', userId).order('meal_date', { ascending: false }).limit(90),
    supabase.from('nutrition_supplements').select('*').eq('user_id', userId).order('supplement_date', { ascending: false }).limit(180),
    supabase.from('nutrition_favorite_foods').select('*').eq('user_id', userId).order('name', { ascending: true }),
  ]);

  const error = macroResult.error || mealsResult.error || supplementsResult.error || favoritesResult.error;
  if (error) throw new Error(`Falha ao carregar nutrição: ${error.message}`);

  return {
    dataMode: 'supabase',
    macros: macroResult.data ? {
      calories: macroResult.data.calories,
      protein: macroResult.data.protein,
      carbs: macroResult.data.carbs,
      fat: macroResult.data.fat,
    } : null,
    meals: (mealsResult.data || []).map(mapMeal),
    supplements: (supplementsResult.data || []).map(mapSupplement),
    favoriteFoods: (favoritesResult.data || []).map(mapFavoriteFood),
  };
}

export async function saveNutritionMacros(input: MacroTargets): Promise<PersistResult & { macros: MacroTargets }> {
  const macros = validateMacroTargets(input);
  const userId = await getAuthUserId();

  if (!userId) {
    persistDevState({ macros });
    return { dataMode: 'mock_dev_only', macros, warning: devState().warning };
  }

  const { error } = await supabase.from('nutrition_macro_targets').upsert({
    user_id: userId,
    calories: macros.calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) throw new Error(`Falha ao salvar macros: ${error.message}`);
  logAuditEvent('nutrition.macros.upsert', 'Metas nutricionais atualizadas.', userId);
  return { dataMode: 'supabase', macros };
}

export async function addNutritionMeal(input: Partial<MealEntry>): Promise<PersistResult & { meal: MealEntry }> {
  const meal = validateMealInput(input);
  const userId = await getAuthUserId();

  if (!userId) {
    const state = devState();
    persistDevState({ meals: [meal, ...state.meals] });
    return { dataMode: 'mock_dev_only', meal, warning: state.warning };
  }

  const { error } = await supabase.from('nutrition_meals').insert({
    id: meal.id,
    user_id: userId,
    meal_date: meal.date,
    meal_type: meal.mealType,
    description: meal.description,
    estimated_calories: meal.estimatedCalories,
    estimated_protein: meal.estimatedProtein,
    estimated_carbs: meal.estimatedCarbs,
    estimated_fat: meal.estimatedFat,
    ai_analysis: meal.aiAnalysis,
  });

  if (error) throw new Error(`Falha ao registrar refeição: ${error.message}`);
  logAuditEvent('nutrition.meal.insert', `Refeição registrada: ${meal.mealType}.`, userId);
  return { dataMode: 'supabase', meal };
}

export async function addNutritionSupplement(input: Partial<SupplementEntry>): Promise<PersistResult & { supplement: SupplementEntry }> {
  const supplement = validateSupplementInput(input);
  const userId = await getAuthUserId();

  if (!userId) {
    const state = devState();
    persistDevState({ supplements: [supplement, ...state.supplements] });
    return { dataMode: 'mock_dev_only', supplement, warning: state.warning };
  }

  const { error } = await supabase.from('nutrition_supplements').insert({
    id: supplement.id,
    user_id: userId,
    supplement_date: supplement.date,
    name: supplement.name,
    dose: supplement.dose,
    timing: supplement.timing,
    taken: supplement.taken,
    notes: supplement.notes,
  });

  if (error) throw new Error(`Falha ao registrar suplemento: ${error.message}`);
  logAuditEvent('nutrition.supplement.insert', `Suplemento registrado: ${supplement.name}.`, userId);
  return { dataMode: 'supabase', supplement };
}

export async function addNutritionFavoriteFood(input: Partial<FavoriteFood>): Promise<PersistResult & { food: FavoriteFood }> {
  const food = validateFavoriteFoodInput(input);
  const userId = await getAuthUserId();

  if (!userId) {
    const state = devState();
    persistDevState({ favoriteFoods: [food, ...state.favoriteFoods] });
    return { dataMode: 'mock_dev_only', food, warning: state.warning };
  }

  const { error } = await supabase.from('nutrition_favorite_foods').insert({
    id: food.id,
    user_id: userId,
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
  });

  if (error) throw new Error(`Falha ao salvar alimento favorito: ${error.message}`);
  return { dataMode: 'supabase', food };
}

function scoreMacro(actual: number, target: number) {
  if (!target) return 0;
  return Math.max(0, 1 - Math.abs(actual - target) / target);
}

function getLastSevenDates(today = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });
}

export function buildWeeklyNutritionAdherence(
  meals: MealEntry[],
  targets: MacroTargets | null,
  today = new Date(),
): WeeklyNutritionAdherence {
  const dates = getLastSevenDates(today);
  const days = dates.map(date => {
    const dateMeals = meals.filter(meal => meal.date === date);
    const calories = dateMeals.reduce((sum, meal) => sum + (meal.estimatedCalories || 0), 0);
    const protein = dateMeals.reduce((sum, meal) => sum + (meal.estimatedProtein || 0), 0);
    const carbs = dateMeals.reduce((sum, meal) => sum + (meal.estimatedCarbs || 0), 0);
    const fat = dateMeals.reduce((sum, meal) => sum + (meal.estimatedFat || 0), 0);
    const adherence = targets
      ? Math.round((
          scoreMacro(calories, targets.calories) * 0.45 +
          scoreMacro(protein, targets.protein) * 0.35 +
          scoreMacro(carbs, targets.carbs) * 0.1 +
          scoreMacro(fat, targets.fat) * 0.1
        ) * 100)
      : 0;

    return { date, calories, protein, carbs, fat, adherence };
  });

  const daysWithFood = days.filter(day => day.calories > 0 || day.protein > 0 || day.carbs > 0 || day.fat > 0);
  const averageAdherence = daysWithFood.length
    ? Math.round(daysWithFood.reduce((sum, day) => sum + day.adherence, 0) / daysWithFood.length)
    : 0;
  const sorted = [...daysWithFood].sort((a, b) => b.adherence - a.adherence);

  return {
    averageAdherence,
    bestDay: sorted[0],
    worstDay: sorted[sorted.length - 1],
    days,
    summary: daysWithFood.length
      ? `Aderência média de ${averageAdherence}% em ${daysWithFood.length} dia(s) com refeições registradas.`
      : 'Sem refeições com macros nos últimos 7 dias.',
  };
}

export function modeLabel(dataMode: DataMode) {
  return dataMode === 'supabase' ? 'Supabase' : 'mock_dev_only';
}
