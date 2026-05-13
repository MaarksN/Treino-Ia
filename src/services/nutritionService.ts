import { Schema, Type } from '../types/geminiSchema';
import { MacroTargets, MealEntry, UserProfile } from '../types';
import { createGeminiProxyClient } from './geminiProxyClient';

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

export async function generateMacroTargets(profile: UserProfile): Promise<MacroTargets> {
  const prompt = `
Calcule as metas de macros diários para este perfil:
${JSON.stringify(profile, null, 2)}

Retorne apenas JSON com: calories, protein (g), carbs (g), fat (g).
`;

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: macroSchema },
  });

  return JSON.parse(response.text || '{}') as MacroTargets;
}

export async function generateBasicNutritionPlan(profile: UserProfile): Promise<string> {
  const prompt = `
Crie um plano nutricional básico e prático para:
${JSON.stringify(profile, null, 2)}

Inclua: 5-6 refeições com exemplos de alimentos, distribuição de macros, dicas práticas.
`;

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  return response.text || 'Sem plano disponível.';
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
  const prompt = `
Sugira uma refeição pré-treino para:
Objetivo: ${profile.goal}
Horário do treino: ${workoutTime}
Peso: ${profile.weight}kg

Dê opções rápidas, práticas e com tempo de consumo antes do treino.
`;

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  return response.text || 'Sem sugestão.';
}

export async function generatePostWorkoutSuggestion(profile: UserProfile): Promise<string> {
  const prompt = `
Sugira uma refeição pós-treino para:
Objetivo: ${profile.goal}
Peso: ${profile.weight}kg

Inclua opções rápidas e práticas, proporção proteína/carboidrato e hidratação.
`;

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  return response.text || 'Sem sugestão.';
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

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  return response.text || 'Sem análise.';
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
