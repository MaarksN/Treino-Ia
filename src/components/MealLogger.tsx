import React from 'react';
import { MealEntry } from '../types';

interface Props {
  meals: MealEntry[];
}

export function MealLogger({ meals }: Props) {
  if (!meals.length) {
    return <p className="text-brand-muted text-sm">Sem refeições registradas ainda.</p>;
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {[...meals].reverse().slice(0, 20).map(meal => (
        <div key={meal.id} className="p-3 bg-brand-dark border-2 border-brand-light/10">
          <div className="flex justify-between gap-3">
            <p className="text-brand-light text-sm font-semibold">{meal.mealType}</p>
            <p className="text-brand-muted text-xs">{meal.date}</p>
          </div>
          <p className="text-brand-muted text-xs mt-0.5">{meal.description}</p>
          {meal.estimatedCalories && (
            <p className="text-orange-400 text-xs mt-1">
              {meal.estimatedCalories} kcal | P: {meal.estimatedProtein}g | C: {meal.estimatedCarbs}g | G: {meal.estimatedFat}g
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
