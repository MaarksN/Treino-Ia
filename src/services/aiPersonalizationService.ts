import { Schema, Type } from '@google/genai';
import {
  AiFeedback,
  MacrocyclePhase,
  Microcycle,
  RecoveryCheckin,
  UserProfile,
  WorkoutPlan,
  WorkoutSession,
} from '../types';
import { computeDeterministicFlags, validateAvailableMinutes } from '../utils/personalizationRules';
import { createGeminiProxyClient } from './geminiProxyClient';

const MODEL = 'gemini-2.5-pro';

function getAI() {
  return createGeminiProxyClient();
}

function parseJSON<T>(text: string | undefined, fallback: T): T {
  try {
    return JSON.parse(text || '') as T;
  } catch {
    return fallback;
  }
}

const macrocycleSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      objective: { type: Type.STRING },
      durationWeeks: { type: Type.INTEGER },
      intensity: { type: Type.STRING },
      volume: { type: Type.STRING },
    },
    required: ['name', 'objective', 'durationWeeks', 'intensity', 'volume'],
  },
};

const microcycleSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      week: { type: Type.INTEGER },
      focus: { type: Type.STRING },
      notes: { type: Type.STRING },
    },
    required: ['week', 'focus', 'notes'],
  },
};

export async function generateAdvancedWorkoutPlan(profile: UserProfile, sessions: WorkoutSession[] = []) {
  const recentHistory = sessions.slice(-5).map(session => ({
    date: session.completedAt,
    readiness: session.readiness,
    exercises: session.logs.map(log => ({
      exerciseName: log.exerciseName,
      weight: log.actualWeight,
      reps: log.actualReps,
      rpe: log.rpe,
      feedback: log.feedback,
    })),
  }));

  const prompt = `
Você é um head coach premium de musculação e performance.
Crie uma orientação avançada para gerar um plano de treino com base na anamnese abaixo.

PERFIL:
${JSON.stringify(profile, null, 2)}

HISTÓRICO RECENTE:
${JSON.stringify(recentHistory, null, 2)}

Entregue:
1. split ideal,
2. foco por dia,
3. volume sugerido,
4. frequência ideal,
5. observações de segurança,
6. progressão inicial recomendada.
Responda em português do Brasil.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem resposta.';
}

export async function adaptWeeklyPlan(plan: WorkoutPlan, sessions: WorkoutSession[]) {
  const prompt = `
Adapte o plano semanal abaixo com base nas sessões concluídas.
PLANO:
${JSON.stringify(plan, null, 2)}

SESSÕES:
${JSON.stringify(sessions.slice(-7), null, 2)}

Objetivo:
- aumentar aderência,
- evitar excesso de fadiga,
- corrigir dificuldades,
- manter progressão.

Responda com sugestões em tópicos curtos.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem adaptação disponível.';
}

export async function generateLoadProgressionAdvice(plan: WorkoutPlan, sessions: WorkoutSession[]) {
  const prompt = `
Analise as cargas, reps, RPE e feedbacks abaixo e gere uma recomendação de progressão de carga por exercício.
PLANO:
${JSON.stringify(plan, null, 2)}

SESSÕES:
${JSON.stringify(sessions.slice(-10), null, 2)}

Responda com:
- exercício,
- manter/aumentar/reduzir,
- quanto ajustar,
- justificativa curta.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem orientação de progressão.';
}

export async function predictPlateau(plan: WorkoutPlan, sessions: WorkoutSession[]) {
  const prompt = `
Avalie risco de platô com base no histórico abaixo.
PLANO:
${JSON.stringify(plan, null, 2)}

SESSÕES:
${JSON.stringify(sessions.slice(-12), null, 2)}

Responda:
- nível de risco,
- exercícios com estagnação,
- causa provável,
- ação sugerida.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem risco relevante detectado.';
}

export async function generateDeloadAdvice(plan: WorkoutPlan, sessions: WorkoutSession[]) {
  const prompt = `
Avalie necessidade de deload com base em fadiga, RPE, dor e aderência.

PLANO:
${JSON.stringify(plan, null, 2)}

SESSÕES:
${JSON.stringify(sessions.slice(-10), null, 2)}

Responda com:
- precisa de deload? sim/não
- sinais observados
- como ajustar a próxima semana
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem recomendação de deload.';
}

export async function suggestExerciseAlternatives(exerciseName: string, equipment: string, injuries: string) {
  const prompt = `
Sugira substituições inteligentes para o exercício "${exerciseName}".
Equipamentos disponíveis: ${equipment || 'não informado'}
Lesões ou limitações: ${injuries || 'nenhuma'}

Entregue duas listas:
1. substituição por equipamento disponível
2. substituição por dor/limitação
Responda em tópicos.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem substituições disponíveis.';
}

export async function askAiCoach(
  question: string,
  profile: UserProfile,
  plan: WorkoutPlan,
  sessions: WorkoutSession[]
) {
  const prompt = `
Você é um coach IA premium.
PERFIL:
${JSON.stringify(profile, null, 2)}

PLANO:
${JSON.stringify(plan, null, 2)}

SESSÕES:
${JSON.stringify(sessions.slice(-6), null, 2)}

Pergunta:
${question}

Responda em português, de forma prática, objetiva e técnica.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem resposta do coach.';
}

export async function generatePremiumPostWorkoutFeedback(
  session: WorkoutSession,
  plan: WorkoutPlan
): Promise<AiFeedback> {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      overallAssessment: { type: Type.STRING },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
      nextStepTips: { type: Type.ARRAY, items: { type: Type.STRING } },
      motivationalNote: { type: Type.STRING },
      progressIndicator: { type: Type.INTEGER },
    },
    required: [
      'overallAssessment',
      'strengths',
      'improvements',
      'nextStepTips',
      'motivationalNote',
      'progressIndicator',
    ],
  };

  const prompt = `
Analise esta sessão finalizada e gere uma devolutiva premium.

PLANO:
${JSON.stringify(plan, null, 2)}

SESSÃO:
${JSON.stringify(session, null, 2)}

Seja técnico, personalizado e motivador.
`;

  const response = await getAI().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });

  return parseJSON<AiFeedback>(response.text, {
    overallAssessment: 'Não foi possível gerar a devolutiva agora.',
    strengths: [],
    improvements: [],
    nextStepTips: [],
    motivationalNote: '',
    progressIndicator: 0,
  });
}

export async function recommendWeeklyVolume(profile: UserProfile) {
  const prompt = `
Sugira volume semanal por grupo muscular com base neste perfil:
${JSON.stringify(profile, null, 2)}

Responda com grupos musculares, séries semanais e justificativa breve.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem recomendação.';
}

export async function adjustWorkoutForAvailableTime(plan: WorkoutPlan, availableMinutes: number) {
  const boundedMinutes = validateAvailableMinutes(availableMinutes);
  const prompt = `
Adapte o treino abaixo para ${boundedMinutes} minutos.
${JSON.stringify(plan, null, 2)}

Regras:
- preserve os exercícios mais importantes,
- reduza volume se necessário,
- priorize eficiência,
- responda em tópicos.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem ajuste de tempo.';
}

export async function adjustWorkoutForRecovery(plan: WorkoutPlan, recovery: RecoveryCheckin) {
  const prompt = `
Ajuste o treino de hoje com base na recuperação:
${JSON.stringify(recovery, null, 2)}

PLANO:
${JSON.stringify(plan, null, 2)}

Responda com:
- manter/reduzir/aumentar intensidade,
- exercícios para atenção,
- observações do dia.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem ajuste de recuperação.';
}

export async function generateMacrocycle(profile: UserProfile): Promise<MacrocyclePhase[]> {
  const prompt = `
Crie um macrociclo anual de treino para este perfil:
${JSON.stringify(profile, null, 2)}

Entregue fases com objetivo, duração, intensidade e volume.
`;

  const response = await getAI().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: macrocycleSchema,
    },
  });

  return parseJSON<MacrocyclePhase[]>(response.text, []);
}

export async function generateMicrocycles(profile: UserProfile, goal: string): Promise<Microcycle[]> {
  const prompt = `
Crie 4 microciclos/mesociclos curtos para o objetivo "${goal}" considerando:
${JSON.stringify(profile, null, 2)}
`;

  const response = await getAI().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: microcycleSchema,
    },
  });

  return parseJSON<Microcycle[]>(response.text, []);
}

export async function suggestAdvancedMethods(profile: UserProfile) {
  const prompt = `
Sugira métodos avançados adequados para este perfil:
${JSON.stringify(profile, null, 2)}

Considere nível, objetivo e segurança. Exemplos possíveis: drop set, rest-pause, bi-set, cluster, myo-reps.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem métodos sugeridos.';
}

export async function recommendIdealFrequency(profile: UserProfile) {
  const prompt = `
Recomende a frequência ideal de treino por semana para este perfil:
${JSON.stringify(profile, null, 2)}

Considere aderência, objetivo, recuperação e disponibilidade.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem recomendação de frequência.';
}

export async function adjustBySleepAndStress(plan: WorkoutPlan, sleepHours: string, stressLevel: string) {
  const prompt = `
Ajuste o treino com base nos dados abaixo:
Sono: ${sleepHours}
Estresse: ${stressLevel}

Plano:
${JSON.stringify(plan, null, 2)}

Responda em tópicos curtos.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem ajuste.';
}

export async function generateWeeklyAiInsights(profile: UserProfile, sessions: WorkoutSession[]) {
  const prompt = `
Gere um relatório semanal com insights de IA.
PERFIL:
${JSON.stringify(profile, null, 2)}

SESSÕES:
${JSON.stringify(sessions.slice(-7), null, 2)}

Inclua:
- consistência,
- fadiga,
- progresso,
- aderência,
- recomendação da próxima semana.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem insights.';
}

export async function detectRiskOfAbandonment(profile: UserProfile, sessions: WorkoutSession[]) {
  const flags = computeDeterministicFlags(profile, sessions);
  const prompt = `
Analise risco de inconsistência ou abandono.
Sinal determinístico atual: ${flags.adherenceRisk}.
Sessões:
${JSON.stringify(sessions.slice(-14), null, 2)}

Indique:
- risco baixo/médio/alto
- sinais
- ação recomendada
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem risco detectado.';
}

export async function generateDayVariations(plan: WorkoutPlan, context: string) {
  const prompt = `
Gere variações inteligentes para o treino do dia.
Contexto do dia: ${context}

Plano:
${JSON.stringify(plan, null, 2)}

Considere energia, equipamento, tempo e motivação.
`;

  const response = await getAI().models.generateContent({ model: MODEL, contents: prompt });
  return response.text || 'Sem variações.';
}
