import { GoogleGenAI, Schema, Type } from '@google/genai';
import {
  AutoAdjustSuggestion,
  CoachMessage,
  DailyCheckin,
  UserProfile,
  WorkoutHistoryEntry,
  WorkoutPlan,
} from '../types';

const MODEL = 'gemini-2.5-pro';

let aiClient: GoogleGenAI | null = null;

function getAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada.');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return aiClient;
}

const buildSystemPrompt = (profile: UserProfile, plan: WorkoutPlan | null, streak: number) => `
Você é o APEX Coach, um personal trainer de elite com mais de 20 anos de experiência em musculação, powerlifting e fisiologia do exercício.

Contexto do atleta:
- Objetivo: ${profile.goal}
- Nível: ${profile.experienceLevel}
- Peso: ${profile.weight}kg | Altura: ${profile.height}cm
- Dias por semana: ${profile.daysPerWeek}
- Plano atual: ${plan?.planName || 'Nenhum'}
- Streak atual: ${streak} dias

Seu estilo:
- Direto, técnico, sem enrolação
- Use dados do atleta para respostas específicas
- Jamais dê conselhos médicos ou sobre medicamentos
- Perguntas de treinamento, nutrição básica, recovery: responda com profundidade
- Máximo 4 parágrafos por resposta
- Use emojis com moderação
`;

export async function sendCoachMessage(
  message: string,
  history: CoachMessage[],
  profile: UserProfile,
  plan: WorkoutPlan | null,
  streak: number
): Promise<string> {
  const contents = [
    ...history.slice(-8).map(item => ({
      role: item.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: item.content }],
    })),
    { role: 'user' as const, parts: [{ text: message }] },
  ];

  const response = await getAI().models.generateContent({
    model: MODEL,
    contents,
    config: { systemInstruction: buildSystemPrompt(profile, plan, streak) },
  });

  return response.text || 'Não consegui processar sua mensagem. Tente novamente.';
}

const adjustSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          affectedDay: { type: Type.STRING },
          affectedExercise: { type: Type.STRING },
          action: { type: Type.STRING },
        },
        required: ['type', 'title', 'description', 'action'],
      },
    },
    overallAssessment: { type: Type.STRING },
    priorityLevel: { type: Type.STRING },
  },
  required: ['suggestions', 'overallAssessment', 'priorityLevel'],
};

function normalizeSuggestion(suggestion: AutoAdjustSuggestion): AutoAdjustSuggestion {
  const allowedTypes: AutoAdjustSuggestion['type'][] = [
    'volume_reduction',
    'intensity_increase',
    'deload',
    'frequency_change',
    'exercise_swap',
  ];

  return {
    ...suggestion,
    type: allowedTypes.includes(suggestion.type) ? suggestion.type : 'exercise_swap',
  };
}

export async function generatePlanAdjustments(
  plan: WorkoutPlan,
  history: WorkoutHistoryEntry[],
  checkins: DailyCheckin[],
  profile: UserProfile
): Promise<{ suggestions: AutoAdjustSuggestion[]; overallAssessment: string; priorityLevel: string }> {
  const recentHistory = history.slice(-14);
  const recentCheckins = checkins.slice(-7);

  const avgVolume = recentHistory.length
    ? recentHistory.reduce((sum, entry) => sum + entry.totalVolume, 0) / recentHistory.length
    : 0;

  const avgReadiness = recentCheckins.length
    ? recentCheckins.reduce((sum, checkin) => sum + checkin.energyLevel, 0) / recentCheckins.length
    : 5;

  const prompt = `
Analise o plano de treino e sugira ajustes inteligentes.

Perfil: ${JSON.stringify({ goal: profile.goal, level: profile.experienceLevel, weight: profile.weight })}
Plano: ${JSON.stringify({
    name: plan.planName,
    goal: plan.goalDescription,
    days: plan.days.map(day => ({
      dayName: day.dayName,
      focus: day.focus,
      exercises: day.exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest,
        muscleGroup: exercise.muscleGroup,
      })),
    })),
  })}
Histórico recente (14d): ${recentHistory.length} sessões, volume médio ${Math.round(avgVolume)}kg
Check-ins recentes: energia média ${avgReadiness.toFixed(1)}/10
Aderência estimada: ${Math.round((recentHistory.length / 14) * 100)}%

Sugira 3-5 ajustes específicos e acionáveis. Responda em JSON válido no schema solicitado.
`;

  const response = await getAI().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: adjustSchema },
  });

  const parsed = JSON.parse(response.text || '{}') as {
    suggestions?: AutoAdjustSuggestion[];
    overallAssessment?: string;
    priorityLevel?: string;
  };

  return {
    suggestions: (parsed.suggestions || []).map(normalizeSuggestion),
    overallAssessment: parsed.overallAssessment || 'Sem avaliação disponível.',
    priorityLevel: parsed.priorityLevel || 'baixa',
  };
}

export async function analyzeStagnation(
  history: WorkoutHistoryEntry[],
  profile: UserProfile
): Promise<string> {
  const recentVolumes = history.slice(-12).map(entry => entry.totalVolume).filter(volume => volume > 0);
  const isStagnant = recentVolumes.length >= 4
    && Math.max(...recentVolumes) - Math.min(...recentVolumes) < 500;

  if (!isStagnant) return '';

  const prompt = `
O atleta parece estar estagnado. Volumes das últimas sessões: ${recentVolumes.join(', ')}kg
Objetivo: ${profile.goal} | Nível: ${profile.experienceLevel}

Identifique a causa provável (overreaching, falta de progressão, adaptação) e sugira estratégias específicas para quebrar a estagnação. Máximo 3 parágrafos.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || '';
}

export async function getNutritionalAdvice(
  question: string,
  profile: UserProfile
): Promise<string> {
  const prompt = `
Pergunta nutricional do atleta: "${question}"

Contexto: objetivo ${profile.goal}, ${profile.weight}kg, nível ${profile.experienceLevel}

Responda de forma técnica, prática e baseada em evidências. Máximo 3 parágrafos. Não prescreva tratamento médico.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Não consegui gerar o conselho nutricional agora.';
}
