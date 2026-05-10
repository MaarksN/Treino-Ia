import { MacroPlan, NutritionProfile } from '../types/nutrition';

export function buildFallbackMealPlan(profile: NutritionProfile, macros: MacroPlan) {
  return [
    `Cafe da manha: ovos, fruta e aveia para iniciar com energia.`,
    `Almoco: arroz, feijao, frango e salada para bater proteina sem complicar.`,
    `Pre-treino: banana com whey 60-90 min antes do treino.`,
    `Pos-treino: refeicao com ${Math.round(macros.proteinG / 4)}g de proteina e carbo moderado.`,
    `Meta do dia: ${macros.calories} kcal, ${macros.proteinG}g proteina, ${macros.carbsG}g carbo, ${macros.fatG}g gordura.`,
    `Objetivo atual: ${profile.goal}. Ajuste semanal pelo peso medio e performance.`,
  ];
}

export function getWorkoutNutritionTiming(workoutTime: string) {
  return {
    pre: `Consumir carbo facil + proteina leve cerca de 60-90 min antes de ${workoutTime}.`,
    post: 'Priorizar proteina completa, carbo conforme volume do treino e agua com sodio se suou muito.',
  };
}
