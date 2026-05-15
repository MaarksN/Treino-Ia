import { ensureSafeDataMode } from '../utils/dataMode';
import {
  DailyCheckin,
  FavoriteFood,
  HydrationEntry,
  HydrationGoal,
  InjuryRecord,
  MacroTargets,
  MealEntry,
  SleepEntry,
  SymptomRecord,
} from '../types';
import { DataMode, PersistResult } from '../types/trainingExecution';
import { sanitizeText } from '../utils/inputSanitizer';
import { calculateReadiness } from '../utils/readinessUtils';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const MOCK_WARNING =
  'Supabase não está configurado ou o usuário não está autenticado; dados de saúde/nutrição salvos apenas como mock_dev_only local.';

const DEV_KEYS = {
  checkins: '@TreinoApp:checkins:mock_dev_only',
  injuries: '@TreinoApp:injuries:mock_dev_only',
  symptoms: '@TreinoApp:symptoms:mock_dev_only',
  macros: '@TreinoApp:macros:mock_dev_only',
  nutritionPlan: '@TreinoApp:nutritionPlan:mock_dev_only',
  meals: '@TreinoApp:meals:mock_dev_only',
  favoriteFoods: '@TreinoApp:favFoods:mock_dev_only',
  hydrationEntries: '@TreinoApp:hydration:mock_dev_only',
  hydrationGoal: '@TreinoApp:hydrationGoal:mock_dev_only',
  sleepEntries: '@TreinoApp:sleep:mock_dev_only',
};

const LEGACY_KEYS = {
  checkins: '@TreinoApp:checkins',
  injuries: '@TreinoApp:injuries',
  symptoms: '@TreinoApp:symptoms',
  macros: '@TreinoApp:macros',
  meals: '@TreinoApp:meals',
  favoriteFoods: '@TreinoApp:favFoods',
  hydrationEntries: '@TreinoApp:hydration',
  hydrationGoal: '@TreinoApp:hydrationGoal',
  sleepEntries: '@TreinoApp:sleep',
};

const MEAL_TYPES: MealEntry['mealType'][] = ['Café da manhã', 'Almoço', 'Jantar', 'Lanche', 'Pré-treino', 'Pós-treino'];
const HYDRATION_TYPES: HydrationEntry['type'][] = ['água', 'isotônico', 'whey', 'café', 'outro'];
const SEVERITIES: InjuryRecord['severity'][] = ['leve', 'moderada', 'grave'];

interface HealthResult<T> extends PersistResult {
  data: T;
}

export interface NutritionState {
  macros: MacroTargets | null;
  planText: string;
  meals: MealEntry[];
  favoriteFoods: FavoriteFood[];
}

export interface HydrationState {
  entries: HydrationEntry[];
  goal: HydrationGoal;
}

type SupabaseErrorLike = { message?: string } | null | undefined;

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

function readDevJSON<T>(key: string, fallback: T, legacyKey?: string): T {
  const current = readJSON<T>(key, fallback);
  if (Array.isArray(current) && current.length === 0 && legacyKey) {
    return readJSON<T>(legacyKey, fallback);
  }
  if (!Array.isArray(current) && current === fallback && legacyKey) {
    return readJSON<T>(legacyKey, fallback);
  }
  return current;
}

function writeJSON<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function mockResult<T>(data: T): HealthResult<T> {
  return {
    data,
    dataMode: ensureSafeDataMode('mock_dev_only'),
    warning: MOCK_WARNING,
  };
}

function supabaseResult<T>(data: T): HealthResult<T> {
  return {
    data,
    dataMode: 'supabase',
  };
}

function assertNoError(error: SupabaseErrorLike, fallback: string): void {
  if (error) throw new Error(error.message || fallback);
}

async function getAuthUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.id) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

function requiredText(value: unknown, field: string, max = 500): string {
  const text = sanitizeText(String(value ?? '')).slice(0, max);
  if (!text) throw new Error(`${field} é obrigatório.`);
  return text;
}

function optionalText(value: unknown, max = 1000): string | undefined {
  const text = sanitizeText(String(value ?? '')).slice(0, max);
  return text || undefined;
}

function boundedNumber(value: unknown, field: string, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${field} deve estar entre ${min} e ${max}.`);
  }
  return parsed;
}

function boundedInteger(value: unknown, field: string, min: number, max: number): number {
  return Math.round(boundedNumber(value, field, min, max));
}

function normalizeDate(value: unknown, field = 'Data'): string {
  const date = String(value ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${field} deve estar no formato YYYY-MM-DD.`);
  }
  return date;
}

function normalizeTime(value: unknown, field: string): string {
  const time = String(value ?? '');
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error(`${field} deve estar no formato HH:mm.`);
  }
  return time;
}

function normalizeId(value: unknown): string {
  const candidate = String(value ?? '');
  return candidate || crypto.randomUUID();
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeSorenessMap(input: Record<string, number>): Record<string, number> {
  const entries = Object.entries(input || {}).slice(0, 20).map(([region, value]) => [
    requiredText(region, 'Região', 80),
    boundedInteger(value, `Dor em ${region}`, 0, 10),
  ]);
  return Object.fromEntries(entries);
}

export function validateDailyCheckin(input: DailyCheckin): DailyCheckin {
  return {
    id: normalizeId(input.id),
    date: normalizeDate(input.date),
    sleepHours: boundedNumber(input.sleepHours, 'Horas de sono', 0, 14),
    sleepQuality: boundedInteger(input.sleepQuality, 'Qualidade do sono', 1, 5),
    stressLevel: boundedInteger(input.stressLevel, 'Nível de estresse', 1, 10),
    sorenessMap: normalizeSorenessMap(input.sorenessMap),
    energyLevel: boundedInteger(input.energyLevel, 'Nível de energia', 1, 10),
    hydrationGlasses: boundedInteger(input.hydrationGlasses, 'Copos de água', 0, 30),
    sleepGoalHours: boundedNumber(input.sleepGoalHours, 'Meta de sono', 4, 12),
    notes: optionalText(input.notes, 2000),
    timestamp: Number.isFinite(Number(input.timestamp)) ? Number(input.timestamp) : Date.now(),
  };
}

function mapDailyCheckin(row: Record<string, unknown>): DailyCheckin {
  return {
    id: String(row.id),
    date: String(row.date),
    sleepHours: Number(row.sleep_hours),
    sleepQuality: Number(row.sleep_quality),
    stressLevel: Number(row.stress_level),
    sorenessMap: (row.soreness_map && typeof row.soreness_map === 'object' ? row.soreness_map : {}) as Record<string, number>,
    energyLevel: Number(row.energy_level),
    hydrationGlasses: Number(row.hydration_glasses),
    sleepGoalHours: Number(row.sleep_goal_hours),
    notes: row.notes ? String(row.notes) : undefined,
    timestamp: row.updated_at ? new Date(String(row.updated_at)).getTime() : Date.now(),
  };
}

export async function loadDailyCheckins(): Promise<HealthResult<DailyCheckin[]>> {
  const userId = await getAuthUserId();
  if (!userId) {
    const checkins = readDevJSON<DailyCheckin[]>(DEV_KEYS.checkins, [], LEGACY_KEYS.checkins)
      .map(validateDailyCheckin)
      .sort((a, b) => a.date.localeCompare(b.date));
    return mockResult(checkins);
  }

  const { data, error } = await supabase
    .from('recovery_daily_checkins')
    .select('*')
    .order('date', { ascending: true });

  assertNoError(error, 'Falha ao carregar check-ins.');
  return supabaseResult((data ?? []).map(row => mapDailyCheckin(row as Record<string, unknown>)));
}

export async function saveDailyCheckin(input: DailyCheckin): Promise<HealthResult<DailyCheckin>> {
  const checkin = validateDailyCheckin(input);
  const userId = await getAuthUserId();

  if (!userId) {
    const current = readDevJSON<DailyCheckin[]>(DEV_KEYS.checkins, [], LEGACY_KEYS.checkins);
    const index = current.findIndex(item => item.date === checkin.date);
    const next = index >= 0
      ? current.map(item => item.date === checkin.date ? checkin : item)
      : [...current, checkin];
    writeJSON(DEV_KEYS.checkins, next.slice(-180));
    return mockResult(checkin);
  }

  const readiness = calculateReadiness(checkin);
  const row = {
    ...(isUuid(checkin.id) ? { id: checkin.id } : {}),
    user_id: userId,
    date: checkin.date,
    sleep_hours: checkin.sleepHours,
    sleep_quality: checkin.sleepQuality,
    stress_level: checkin.stressLevel,
    soreness_map: checkin.sorenessMap,
    energy_level: checkin.energyLevel,
    hydration_glasses: checkin.hydrationGlasses,
    sleep_goal_hours: checkin.sleepGoalHours,
    notes: checkin.notes ?? null,
    readiness_score: readiness.score,
    readiness_label: readiness.label,
  };

  const { data, error } = await supabase
    .from('recovery_daily_checkins')
    .upsert(row, { onConflict: 'user_id,date' })
    .select()
    .single();

  assertNoError(error, 'Falha ao salvar check-in.');
  return supabaseResult(mapDailyCheckin(data as Record<string, unknown>));
}

export function getTodayCheckinFromList(checkins: DailyCheckin[]): DailyCheckin | null {
  const today = new Date().toISOString().slice(0, 10);
  return checkins.find(checkin => checkin.date === today) ?? null;
}

function validateInjury(input: Partial<InjuryRecord>): InjuryRecord {
  const severity = SEVERITIES.includes(input.severity as InjuryRecord['severity']) ? input.severity as InjuryRecord['severity'] : 'leve';
  return {
    id: normalizeId(input.id),
    region: requiredText(input.region, 'Região', 80),
    description: requiredText(input.description, 'Descrição', 500),
    severity,
    startDate: normalizeDate(input.startDate || new Date().toISOString().slice(0, 10), 'Data inicial'),
    resolved: Boolean(input.resolved),
    resolvedDate: input.resolvedDate ? normalizeDate(input.resolvedDate, 'Data de resolução') : undefined,
    notes: optionalText(input.notes, 1000),
  };
}

function mapInjury(row: Record<string, unknown>): InjuryRecord {
  return {
    id: String(row.id),
    region: String(row.region),
    description: String(row.description),
    severity: String(row.severity) as InjuryRecord['severity'],
    startDate: String(row.start_date),
    resolved: Boolean(row.resolved),
    resolvedDate: row.resolved_date ? String(row.resolved_date) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
  };
}

export async function loadInjuryRecords(): Promise<HealthResult<InjuryRecord[]>> {
  const userId = await getAuthUserId();
  if (!userId) return mockResult(readDevJSON<InjuryRecord[]>(DEV_KEYS.injuries, [], LEGACY_KEYS.injuries).map(validateInjury));

  const { data, error } = await supabase
    .from('health_injury_records')
    .select('*')
    .order('start_date', { ascending: false });

  assertNoError(error, 'Falha ao carregar lesões.');
  return supabaseResult((data ?? []).map(row => mapInjury(row as Record<string, unknown>)));
}

export async function createInjuryRecord(input: Partial<InjuryRecord>): Promise<HealthResult<InjuryRecord>> {
  const injury = validateInjury(input);
  const userId = await getAuthUserId();

  if (!userId) {
    const next = [injury, ...readDevJSON<InjuryRecord[]>(DEV_KEYS.injuries, [], LEGACY_KEYS.injuries)].slice(0, 120);
    writeJSON(DEV_KEYS.injuries, next);
    return mockResult(injury);
  }

  const { data, error } = await supabase
    .from('health_injury_records')
    .insert({
      ...(isUuid(injury.id) ? { id: injury.id } : {}),
      user_id: userId,
      region: injury.region,
      description: injury.description,
      severity: injury.severity,
      start_date: injury.startDate,
      resolved: injury.resolved ?? false,
      resolved_date: injury.resolvedDate ?? null,
      notes: injury.notes ?? null,
    })
    .select()
    .single();

  assertNoError(error, 'Falha ao registrar lesão.');
  return supabaseResult(mapInjury(data as Record<string, unknown>));
}

export async function resolveInjuryRecord(id: string): Promise<HealthResult<InjuryRecord[]>> {
  const userId = await getAuthUserId();
  const resolvedDate = new Date().toISOString().slice(0, 10);

  if (!userId) {
    const next = readDevJSON<InjuryRecord[]>(DEV_KEYS.injuries, [], LEGACY_KEYS.injuries).map(injury =>
      injury.id === id ? { ...injury, resolved: true, resolvedDate } : injury
    );
    writeJSON(DEV_KEYS.injuries, next);
    return mockResult(next);
  }

  const { error } = await supabase
    .from('health_injury_records')
    .update({ resolved: true, resolved_date: resolvedDate })
    .eq('id', id);

  assertNoError(error, 'Falha ao resolver lesão.');
  return loadInjuryRecords();
}

function validateSymptom(input: Partial<SymptomRecord>): SymptomRecord {
  return {
    id: normalizeId(input.id),
    date: normalizeDate(input.date || new Date().toISOString().slice(0, 10)),
    region: requiredText(input.region, 'Região', 80),
    symptom: requiredText(input.symptom, 'Sintoma', 500),
    intensity: boundedInteger(input.intensity ?? 5, 'Intensidade', 1, 10),
  };
}

function mapSymptom(row: Record<string, unknown>): SymptomRecord {
  return {
    id: String(row.id),
    date: String(row.date),
    region: String(row.region),
    symptom: String(row.symptom),
    intensity: Number(row.intensity),
  };
}

export async function loadSymptomRecords(): Promise<HealthResult<SymptomRecord[]>> {
  const userId = await getAuthUserId();
  if (!userId) return mockResult(readDevJSON<SymptomRecord[]>(DEV_KEYS.symptoms, [], LEGACY_KEYS.symptoms).map(validateSymptom));

  const { data, error } = await supabase
    .from('health_symptom_records')
    .select('*')
    .order('date', { ascending: false })
    .limit(120);

  assertNoError(error, 'Falha ao carregar sintomas.');
  return supabaseResult((data ?? []).map(row => mapSymptom(row as Record<string, unknown>)));
}

export async function createSymptomRecord(input: Partial<SymptomRecord>): Promise<HealthResult<SymptomRecord>> {
  const symptom = validateSymptom(input);
  const userId = await getAuthUserId();

  if (!userId) {
    const next = [symptom, ...readDevJSON<SymptomRecord[]>(DEV_KEYS.symptoms, [], LEGACY_KEYS.symptoms)].slice(0, 180);
    writeJSON(DEV_KEYS.symptoms, next);
    return mockResult(symptom);
  }

  const { data, error } = await supabase
    .from('health_symptom_records')
    .insert({
      ...(isUuid(symptom.id) ? { id: symptom.id } : {}),
      user_id: userId,
      date: symptom.date,
      region: symptom.region,
      symptom: symptom.symptom,
      intensity: symptom.intensity,
    })
    .select()
    .single();

  assertNoError(error, 'Falha ao registrar sintoma.');
  return supabaseResult(mapSymptom(data as Record<string, unknown>));
}

function validateMacros(input: MacroTargets): MacroTargets {
  return {
    calories: boundedInteger(input.calories, 'Calorias', 800, 8000),
    protein: boundedInteger(input.protein, 'Proteína', 0, 500),
    carbs: boundedInteger(input.carbs, 'Carboidratos', 0, 1000),
    fat: boundedInteger(input.fat, 'Gorduras', 0, 400),
  };
}

function validateMeal(input: Partial<MealEntry>): MealEntry {
  const mealType = MEAL_TYPES.includes(input.mealType as MealEntry['mealType']) ? input.mealType as MealEntry['mealType'] : 'Almoço';
  return {
    id: normalizeId(input.id),
    date: normalizeDate(input.date || new Date().toISOString().slice(0, 10)),
    mealType,
    description: requiredText(input.description, 'Descrição da refeição', 1000),
    estimatedCalories: input.estimatedCalories === undefined ? undefined : boundedInteger(input.estimatedCalories, 'Calorias estimadas', 0, 5000),
    estimatedProtein: input.estimatedProtein === undefined ? undefined : boundedNumber(input.estimatedProtein, 'Proteína estimada', 0, 400),
    estimatedCarbs: input.estimatedCarbs === undefined ? undefined : boundedNumber(input.estimatedCarbs, 'Carboidratos estimados', 0, 800),
    estimatedFat: input.estimatedFat === undefined ? undefined : boundedNumber(input.estimatedFat, 'Gordura estimada', 0, 300),
    aiAnalysis: optionalText(input.aiAnalysis, 4000),
  };
}

function validateFavoriteFood(input: Partial<FavoriteFood>): FavoriteFood {
  return {
    id: normalizeId(input.id),
    name: requiredText(input.name, 'Alimento', 120),
    calories: boundedInteger(input.calories ?? 0, 'Calorias', 0, 5000),
    protein: boundedNumber(input.protein ?? 0, 'Proteína', 0, 400),
    carbs: boundedNumber(input.carbs ?? 0, 'Carboidratos', 0, 800),
    fat: boundedNumber(input.fat ?? 0, 'Gordura', 0, 300),
  };
}

function mapMacros(row: Record<string, unknown> | null): MacroTargets | null {
  if (!row) return null;
  return {
    calories: Number(row.calories),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fat: Number(row.fat),
  };
}

function mapMeal(row: Record<string, unknown>): MealEntry {
  return {
    id: String(row.id),
    date: String(row.date),
    mealType: String(row.meal_type) as MealEntry['mealType'],
    description: String(row.description),
    estimatedCalories: row.estimated_calories === null ? undefined : Number(row.estimated_calories),
    estimatedProtein: row.estimated_protein === null ? undefined : Number(row.estimated_protein),
    estimatedCarbs: row.estimated_carbs === null ? undefined : Number(row.estimated_carbs),
    estimatedFat: row.estimated_fat === null ? undefined : Number(row.estimated_fat),
    aiAnalysis: row.ai_analysis ? String(row.ai_analysis) : undefined,
  };
}

function mapFavoriteFood(row: Record<string, unknown>): FavoriteFood {
  return {
    id: String(row.id),
    name: String(row.name),
    calories: Number(row.calories),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fat: Number(row.fat),
  };
}

export async function loadNutritionState(): Promise<HealthResult<NutritionState>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return mockResult({
      macros: readDevJSON<MacroTargets | null>(DEV_KEYS.macros, null, LEGACY_KEYS.macros),
      planText: readDevJSON<string>(DEV_KEYS.nutritionPlan, ''),
      meals: readDevJSON<MealEntry[]>(DEV_KEYS.meals, [], LEGACY_KEYS.meals).map(validateMeal),
      favoriteFoods: readDevJSON<FavoriteFood[]>(DEV_KEYS.favoriteFoods, [], LEGACY_KEYS.favoriteFoods).map(validateFavoriteFood),
    });
  }

  const [macroResponse, mealResponse, foodResponse] = await Promise.all([
    supabase.from('nutrition_macro_targets').select('*').maybeSingle(),
    supabase.from('nutrition_meal_entries').select('*').order('date', { ascending: true }).limit(180),
    supabase.from('nutrition_favorite_foods').select('*').order('name', { ascending: true }).limit(120),
  ]);

  assertNoError(macroResponse.error, 'Falha ao carregar macros.');
  assertNoError(mealResponse.error, 'Falha ao carregar refeições.');
  assertNoError(foodResponse.error, 'Falha ao carregar favoritos.');

  return supabaseResult({
    macros: mapMacros(macroResponse.data as Record<string, unknown> | null),
    planText: macroResponse.data?.plan_text ? String(macroResponse.data.plan_text) : '',
    meals: (mealResponse.data ?? []).map(row => mapMeal(row as Record<string, unknown>)),
    favoriteFoods: (foodResponse.data ?? []).map(row => mapFavoriteFood(row as Record<string, unknown>)),
  });
}

export async function saveMacroTargets(
  input: MacroTargets,
  profileGoal: string,
  planText = '',
  dataSource: 'deterministic' | 'ai_proxy' = 'deterministic',
): Promise<HealthResult<MacroTargets>> {
  const macros = validateMacros(input);
  const userId = await getAuthUserId();

  if (!userId) {
    writeJSON(DEV_KEYS.macros, macros);
    if (planText) writeJSON(DEV_KEYS.nutritionPlan, sanitizeText(planText).slice(0, 6000));
    return mockResult(macros);
  }

  const { data, error } = await supabase
    .from('nutrition_macro_targets')
    .upsert({
      user_id: userId,
      profile_goal: requiredText(profileGoal, 'Objetivo', 120),
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      plan_text: planText ? sanitizeText(planText).slice(0, 6000) : null,
      data_source: dataSource,
    }, { onConflict: 'user_id' })
    .select()
    .single();

  assertNoError(error, 'Falha ao salvar macros.');
  return supabaseResult(mapMacros(data as Record<string, unknown>) as MacroTargets);
}

export async function saveMealEntry(input: Partial<MealEntry>): Promise<HealthResult<MealEntry>> {
  const meal = validateMeal(input);
  const userId = await getAuthUserId();

  if (!userId) {
    const next = [...readDevJSON<MealEntry[]>(DEV_KEYS.meals, [], LEGACY_KEYS.meals), meal].slice(-240);
    writeJSON(DEV_KEYS.meals, next);
    return mockResult(meal);
  }

  const { data, error } = await supabase
    .from('nutrition_meal_entries')
    .insert({
      ...(isUuid(meal.id) ? { id: meal.id } : {}),
      user_id: userId,
      date: meal.date,
      meal_type: meal.mealType,
      description: meal.description,
      estimated_calories: meal.estimatedCalories ?? null,
      estimated_protein: meal.estimatedProtein ?? null,
      estimated_carbs: meal.estimatedCarbs ?? null,
      estimated_fat: meal.estimatedFat ?? null,
      ai_analysis: meal.aiAnalysis ?? null,
      photo_analyzed: Boolean(input.photoBase64 || meal.aiAnalysis),
    })
    .select()
    .single();

  assertNoError(error, 'Falha ao salvar refeição.');
  return supabaseResult(mapMeal(data as Record<string, unknown>));
}

export async function saveFavoriteFood(input: Partial<FavoriteFood>): Promise<HealthResult<FavoriteFood>> {
  const food = validateFavoriteFood(input);
  const userId = await getAuthUserId();

  if (!userId) {
    const next = [...readDevJSON<FavoriteFood[]>(DEV_KEYS.favoriteFoods, [], LEGACY_KEYS.favoriteFoods), food].slice(-160);
    writeJSON(DEV_KEYS.favoriteFoods, next);
    return mockResult(food);
  }

  const { data, error } = await supabase
    .from('nutrition_favorite_foods')
    .insert({
      ...(isUuid(food.id) ? { id: food.id } : {}),
      user_id: userId,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    })
    .select()
    .single();

  assertNoError(error, 'Falha ao salvar alimento favorito.');
  return supabaseResult(mapFavoriteFood(data as Record<string, unknown>));
}

function validateHydrationGoal(input: HydrationGoal): HydrationGoal {
  return {
    dailyMl: boundedInteger(input.dailyMl, 'Meta de hidratação', 250, 10000),
    remindEveryMinutes: boundedInteger(input.remindEveryMinutes ?? 60, 'Intervalo de lembrete', 0, 720),
  };
}

function validateHydrationEntry(input: HydrationEntry): HydrationEntry {
  const type = HYDRATION_TYPES.includes(input.type) ? input.type : 'água';
  return {
    id: normalizeId(input.id),
    date: normalizeDate(input.date),
    time: normalizeTime(input.time, 'Horário'),
    amountMl: boundedInteger(input.amountMl, 'Quantidade', 1, 5000),
    type,
  };
}

function mapHydrationEntry(row: Record<string, unknown>): HydrationEntry {
  return {
    id: String(row.id),
    date: String(row.date),
    time: String(row.time),
    amountMl: Number(row.amount_ml),
    type: String(row.type) as HydrationEntry['type'],
  };
}

function mapHydrationGoal(row: Record<string, unknown> | null): HydrationGoal {
  if (!row) return { dailyMl: 2500, remindEveryMinutes: 60 };
  return {
    dailyMl: Number(row.daily_ml),
    remindEveryMinutes: Number(row.remind_every_minutes),
  };
}

export async function loadHydrationState(): Promise<HealthResult<HydrationState>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return mockResult({
      entries: readDevJSON<HydrationEntry[]>(DEV_KEYS.hydrationEntries, [], LEGACY_KEYS.hydrationEntries).map(validateHydrationEntry),
      goal: validateHydrationGoal(readDevJSON<HydrationGoal>(DEV_KEYS.hydrationGoal, { dailyMl: 2500, remindEveryMinutes: 60 }, LEGACY_KEYS.hydrationGoal)),
    });
  }

  const [entriesResponse, goalResponse] = await Promise.all([
    supabase.from('hydration_entries').select('*').order('date', { ascending: true }).limit(240),
    supabase.from('hydration_goals').select('*').maybeSingle(),
  ]);

  assertNoError(entriesResponse.error, 'Falha ao carregar hidratação.');
  assertNoError(goalResponse.error, 'Falha ao carregar meta de hidratação.');

  return supabaseResult({
    entries: (entriesResponse.data ?? []).map(row => mapHydrationEntry(row as Record<string, unknown>)),
    goal: mapHydrationGoal(goalResponse.data as Record<string, unknown> | null),
  });
}

export async function saveHydrationEntry(input: HydrationEntry): Promise<HealthResult<HydrationEntry>> {
  const entry = validateHydrationEntry(input);
  const userId = await getAuthUserId();

  if (!userId) {
    const next = [...readDevJSON<HydrationEntry[]>(DEV_KEYS.hydrationEntries, [], LEGACY_KEYS.hydrationEntries), entry].slice(-300);
    writeJSON(DEV_KEYS.hydrationEntries, next);
    return mockResult(entry);
  }

  const { data, error } = await supabase
    .from('hydration_entries')
    .insert({
      ...(isUuid(entry.id) ? { id: entry.id } : {}),
      user_id: userId,
      date: entry.date,
      time: entry.time,
      amount_ml: entry.amountMl,
      type: entry.type,
    })
    .select()
    .single();

  assertNoError(error, 'Falha ao salvar hidratação.');
  return supabaseResult(mapHydrationEntry(data as Record<string, unknown>));
}

export async function saveHydrationGoal(input: HydrationGoal): Promise<HealthResult<HydrationGoal>> {
  const goal = validateHydrationGoal(input);
  const userId = await getAuthUserId();

  if (!userId) {
    writeJSON(DEV_KEYS.hydrationGoal, goal);
    return mockResult(goal);
  }

  const { data, error } = await supabase
    .from('hydration_goals')
    .upsert({
      user_id: userId,
      daily_ml: goal.dailyMl,
      remind_every_minutes: goal.remindEveryMinutes,
    }, { onConflict: 'user_id' })
    .select()
    .single();

  assertNoError(error, 'Falha ao salvar meta de hidratação.');
  return supabaseResult(mapHydrationGoal(data as Record<string, unknown>));
}

function validateSleepEntry(input: SleepEntry): SleepEntry {
  return {
    id: normalizeId(input.id),
    date: normalizeDate(input.date),
    bedtime: normalizeTime(input.bedtime, 'Hora de dormir'),
    wakeTime: normalizeTime(input.wakeTime, 'Hora de acordar'),
    durationMinutes: boundedInteger(input.durationMinutes, 'Duração do sono', 0, 960),
    quality: boundedInteger(input.quality, 'Qualidade do sono', 1, 5) as SleepEntry['quality'],
    notes: optionalText(input.notes, 1000),
    deepSleepPct: input.deepSleepPct === undefined ? undefined : boundedNumber(input.deepSleepPct, 'Sono profundo', 0, 100),
    remSleepPct: input.remSleepPct === undefined ? undefined : boundedNumber(input.remSleepPct, 'Sono REM', 0, 100),
  };
}

function mapSleepEntry(row: Record<string, unknown>): SleepEntry {
  return {
    id: String(row.id),
    date: String(row.date),
    bedtime: String(row.bedtime),
    wakeTime: String(row.wake_time),
    durationMinutes: Number(row.duration_minutes),
    quality: Number(row.quality) as SleepEntry['quality'],
    notes: row.notes ? String(row.notes) : undefined,
    deepSleepPct: row.deep_sleep_pct === null ? undefined : Number(row.deep_sleep_pct),
    remSleepPct: row.rem_sleep_pct === null ? undefined : Number(row.rem_sleep_pct),
  };
}

export async function loadSleepEntries(): Promise<HealthResult<SleepEntry[]>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return mockResult(readDevJSON<SleepEntry[]>(DEV_KEYS.sleepEntries, [], LEGACY_KEYS.sleepEntries).map(validateSleepEntry));
  }

  const { data, error } = await supabase
    .from('sleep_entries')
    .select('*')
    .order('date', { ascending: true })
    .limit(180);

  assertNoError(error, 'Falha ao carregar sono.');
  return supabaseResult((data ?? []).map(row => mapSleepEntry(row as Record<string, unknown>)));
}

export async function saveSleepEntry(input: SleepEntry): Promise<HealthResult<SleepEntry>> {
  const entry = validateSleepEntry(input);
  const userId = await getAuthUserId();

  if (!userId) {
    const current = readDevJSON<SleepEntry[]>(DEV_KEYS.sleepEntries, [], LEGACY_KEYS.sleepEntries);
    const next = current.some(item => item.date === entry.date)
      ? current.map(item => item.date === entry.date ? entry : item)
      : [...current, entry];
    writeJSON(DEV_KEYS.sleepEntries, next.slice(-180));
    return mockResult(entry);
  }

  const { data, error } = await supabase
    .from('sleep_entries')
    .upsert({
      ...(isUuid(entry.id) ? { id: entry.id } : {}),
      user_id: userId,
      date: entry.date,
      bedtime: entry.bedtime,
      wake_time: entry.wakeTime,
      duration_minutes: entry.durationMinutes,
      quality: entry.quality,
      notes: entry.notes ?? null,
      deep_sleep_pct: entry.deepSleepPct ?? null,
      rem_sleep_pct: entry.remSleepPct ?? null,
    }, { onConflict: 'user_id,date' })
    .select()
    .single();

  assertNoError(error, 'Falha ao salvar sono.');
  return supabaseResult(mapSleepEntry(data as Record<string, unknown>));
}

export function dataModeLabel(dataMode: DataMode): string {
  return dataMode === 'supabase' ? 'Supabase' : ensureSafeDataMode('mock_dev_only');
}
