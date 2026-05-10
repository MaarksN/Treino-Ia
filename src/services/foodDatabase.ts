import { FoodItem } from '../types/nutrition';

export const FOOD_DATABASE: FoodItem[] = [
  { id: 'frango', name: 'Peito de frango grelhado', serving: '100g', calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6, source: 'TACO' },
  { id: 'arroz', name: 'Arroz branco cozido', serving: '100g', calories: 128, proteinG: 2.5, carbsG: 28, fatG: 0.2, source: 'TACO' },
  { id: 'feijao', name: 'Feijao carioca cozido', serving: '100g', calories: 76, proteinG: 4.8, carbsG: 13.6, fatG: 0.5, source: 'TACO' },
  { id: 'ovo', name: 'Ovo inteiro', serving: '1 unidade', calories: 70, proteinG: 6.3, carbsG: 0.4, fatG: 4.8, source: 'USDA' },
  { id: 'banana', name: 'Banana prata', serving: '1 unidade', calories: 86, proteinG: 1.1, carbsG: 22, fatG: 0.1, source: 'TACO' },
  { id: 'whey', name: 'Whey protein', serving: '30g', calories: 120, proteinG: 24, carbsG: 3, fatG: 2, source: 'manual' },
];

export function searchFoods(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return FOOD_DATABASE;
  return FOOD_DATABASE.filter(food => food.name.toLowerCase().includes(normalized));
}

export function sumFoods(foodIds: string[]) {
  return foodIds
    .map(id => FOOD_DATABASE.find(food => food.id === id))
    .filter(Boolean)
    .reduce(
      (total, food) => ({
        calories: total.calories + (food?.calories ?? 0),
        proteinG: total.proteinG + (food?.proteinG ?? 0),
        carbsG: total.carbsG + (food?.carbsG ?? 0),
        fatG: total.fatG + (food?.fatG ?? 0),
        waterMl: total.waterMl,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, waterMl: 1800 },
    );
}
