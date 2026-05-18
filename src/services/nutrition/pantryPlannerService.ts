/**
 * Item 59 — Pantry Planner Service
 *
 * Manual pantry management with local meal suggestions.
 * No IoT, no smart fridge, no external API.
 */

export const PANTRY_ITEMS = [
  'ovos', 'arroz', 'frango', 'banana', 'aveia',
  'iogurte', 'feijao', 'legumes', 'batata_doce', 'leite',
  'pao_integral', 'queijo', 'atum', 'pasta_amendoim', 'mel',
] as const;

export type PantryItemId = (typeof PANTRY_ITEMS)[number];

export interface MealSuggestion {
  name: string;
  ingredients: PantryItemId[];
  timing: string;
  description: string;
}

const STORAGE_KEY = '@TreinoIA:nutrition:pantryItems';

const MEAL_RECIPES: MealSuggestion[] = [
  { name: 'Omelete proteico', ingredients: ['ovos', 'queijo', 'legumes'], timing: 'Pré-treino', description: 'Rico em proteínas, leve e rápido.' },
  { name: 'Frango com arroz e feijão', ingredients: ['frango', 'arroz', 'feijao'], timing: 'Pós-treino', description: 'Refeição completa para recuperação.' },
  { name: 'Mingau de aveia com banana', ingredients: ['aveia', 'banana', 'leite'], timing: 'Café da manhã', description: 'Carboidrato complexo para energia sustentada.' },
  { name: 'Iogurte com banana e mel', ingredients: ['iogurte', 'banana', 'mel'], timing: 'Lanche', description: 'Rápido e nutritivo entre refeições.' },
  { name: 'Wrap de atum', ingredients: ['atum', 'pao_integral', 'legumes'], timing: 'Almoço', description: 'Proteína magra com fibras.' },
  { name: 'Batata doce com frango', ingredients: ['batata_doce', 'frango'], timing: 'Pós-treino', description: 'Carboidrato de baixo índice glicêmico com proteína.' },
  { name: 'Sanduíche proteico', ingredients: ['pao_integral', 'ovos', 'queijo'], timing: 'Lanche', description: 'Pratico para levar ao treino.' },
  { name: 'Pasta de amendoim com banana', ingredients: ['pasta_amendoim', 'banana', 'pao_integral'], timing: 'Pré-treino', description: 'Gordura boa + carboidrato para energia.' },
];

export function sanitizePantryItemId(value: unknown): PantryItemId | null {
  if (typeof value !== 'string') return null;
  return PANTRY_ITEMS.includes(value as PantryItemId) ? (value as PantryItemId) : null;
}

export function savePantryItems(ids: PantryItemId[]): PantryItemId[] {
  const sanitized = ids
    .map(id => sanitizePantryItemId(id))
    .filter((id): id is PantryItemId => id !== null);
  const unique = Array.from(new Set(sanitized));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  return unique;
}

export function getPantryItems(): PantryItemId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return parsed
      .map(item => sanitizePantryItemId(item))
      .filter((id): id is PantryItemId => id !== null);
  } catch {
    return [];
  }
}

export function suggestMeals(pantry: PantryItemId[]): MealSuggestion[] {
  if (pantry.length === 0) return [];
  return MEAL_RECIPES.filter(recipe =>
    recipe.ingredients.every(ing => pantry.includes(ing)),
  );
}

export function getPantryItemLabel(id: PantryItemId): string {
  const labels: Record<PantryItemId, string> = {
    ovos: '🥚 Ovos',
    arroz: '🍚 Arroz',
    frango: '🍗 Frango',
    banana: '🍌 Banana',
    aveia: '🥣 Aveia',
    iogurte: '🥛 Iogurte',
    feijao: '🫘 Feijão',
    legumes: '🥦 Legumes',
    batata_doce: '🍠 Batata doce',
    leite: '🥛 Leite',
    pao_integral: '🍞 Pão integral',
    queijo: '🧀 Queijo',
    atum: '🐟 Atum',
    pasta_amendoim: '🥜 Pasta de amendoim',
    mel: '🍯 Mel',
  };
  return labels[id] ?? id;
}

export const PANTRY_DISCLAIMER =
  'A despensa inteligente é um organizador local de alimentos. Sugestões de refeições são educacionais e genéricas. Não há integração com geladeira inteligente, IoT ou API externa. Consulte um nutricionista para orientação individualizada.';
