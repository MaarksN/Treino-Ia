import { Schema, Type } from '../types/geminiSchema';
import { MacroTargets, MealEntry, UserProfile } from '../types';
import { buildFallbackMealPlan, getWorkoutNutritionTiming } from './nutritionAiService';
import { createGeminiProxyClient } from './geminiProxyClient';
import { calculateMacroPlan } from '../utils/macros';
import { nutritionProfileFromUser } from '../utils/tdee';

function getAI() {
  return createGeminiProxyClient();
}

const macroSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    calories: { type: Type.INTEGER },
    protein: { type: Type.INTEGER },
    carbs: { type: Type.INTEGER },
    fat: { type: Type.INTEGER },
  },
  required: ['calories', 'protein', 'carbs', 'fat'],
};

function deterministicMacroTargets(profile: UserProfile): MacroTargets {
  const plan = calculateMacroPlan(nutritionProfileFromUser(profile));
  return {
    calories: plan.calories,
    protein: plan.proteinG,
    carbs: plan.carbsG,
    fat: plan.fatG,
  };
}

export async function generateMacroTargets(profile: UserProfile): Promise<MacroTargets> {
  const fallback = deterministicMacroTargets(profile);
  const prompt = `
Calcule as metas de macros diários para este perfil:
${JSON.stringify(profile, null, 2)}

Retorne apenas JSON com: calories, protein (g), carbs (g), fat (g).
`;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: macroSchema },
    });

    return { ...fallback, ...JSON.parse(response.text || '{}') } as MacroTargets;
  } catch {
    return fallback;
  }
}

export async function generateBasicNutritionPlan(profile: UserProfile): Promise<string> {
  const nutritionProfile = nutritionProfileFromUser(profile);
  const macros = calculateMacroPlan(nutritionProfile);
  const fallback = buildFallbackMealPlan(nutritionProfile, macros).join('\n');

  const prompt = `
Crie um plano nutricional básico e prático para:
${JSON.stringify(profile, null, 2)}

Inclua: 5-6 refeições com exemplos de alimentos, distribuição de macros, dicas práticas.
`;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text || fallback;
  } catch {
    return fallback;
  }
}

export async function analyzePhotoMacros(base64: string, mimeType: string): Promise<Partial<MealEntry>> {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING },
      estimatedCalories: { type: Type.INTEGER },
      estimatedProtein: { type: Type.INTEGER },
      estimatedCarbs: { type: Type.INTEGER },
      estimatedFat: { type: Type.INTEGER },
      aiAnalysis: { type: Type.STRING },
    },
    required: ['description', 'estimatedCalories', 'estimatedProtein', 'estimatedCarbs', 'estimatedFat', 'aiAnalysis'],
  };

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [{
      role: 'user',
      parts: [
        { text: 'Identifique os alimentos, estime calorias, proteínas, carboidratos e gorduras. Avalie se é adequado para um atleta de academia. Responda em JSON.' },
        { inlineData: { data: base64, mimeType } },
      ],
    }],
    config: { responseMimeType: 'application/json', responseSchema: schema },
  });

  return JSON.parse(response.text || '{}') as Partial<MealEntry>;
}

export async function generatePreWorkoutSuggestion(profile: UserProfile, workoutTime: string): Promise<string> {
  const timing = getWorkoutNutritionTiming(workoutTime);
  const prompt = `
Sugira uma refeição pré-treino para:
Objetivo: ${profile.goal}
Horário do treino: ${workoutTime}
Peso: ${profile.weight}kg

Dê opções rápidas, práticas e com tempo de consumo antes do treino.
`;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text || timing.pre;
  } catch {
    return timing.pre;
  }
}

export async function generatePostWorkoutSuggestion(profile: UserProfile): Promise<string> {
  const timing = getWorkoutNutritionTiming(profile.preferredTime || 'após o treino');
  const prompt = `
Sugira uma refeição pós-treino para:
Objetivo: ${profile.goal}
Peso: ${profile.weight}kg

Inclua opções rápidas e práticas, proporção proteína/carboidrato e hidratação.
`;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text || timing.post;
  } catch {
    return timing.post;
  }
}

export async function generateWeeklyNutritionAnalysis(meals: MealEntry[], targets: MacroTargets): Promise<string> {
  const prompt = `
Analise a aderência nutricional da semana.

Metas diárias: ${JSON.stringify(targets)}
Refeições registradas: ${JSON.stringify(meals.slice(-21), null, 2)}

Forneça:
- percentual aproximado de aderência às metas
- dias mais fortes e mais fracos
- recomendações práticas para a próxima semana
`;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text || 'Sem análise.';
  } catch {
    const total = meals.slice(-21).reduce((sum, meal) => sum + (meal.estimatedCalories || 0), 0);
    const days = Math.max(1, new Set(meals.slice(-21).map(meal => meal.date)).size);
    const avg = Math.round(total / days);
    const adherence = targets.calories ? Math.round(Math.min(avg / targets.calories, 1.2) * 100) : 0;
    return `Aderência calórica média: ${adherence}%. Média registrada: ${avg} kcal/dia. Próxima semana: registre proteína em todas as refeições e ajuste por fome, peso e performance.`;
  }
}

export async function analyzeBodyPhoto(
  base64Current: string,
  base64Previous: string | null,
  mimeType: string
): Promise<string> {
  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
    { text: 'Analise a composição corporal aparente nesta foto. Avalie volume muscular aparente, definição e simetria. Seja preciso, mas cauteloso com afirmações médicas.' },
    { inlineData: { data: base64Current, mimeType } },
  ];

  if (base64Previous) {
    parts.push({ text: 'Foto anterior para comparação:' });
    parts.push({ inlineData: { data: base64Previous, mimeType } });
  }

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [{ role: 'user', parts }],
  });

  return response.text || 'Sem análise.';
}
