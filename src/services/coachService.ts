import { GoogleGenAI } from '@google/genai';
import { UserProfile, WorkoutPlan } from '../types';

function getCoachClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada.');
  }

  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function askWorkoutCoach(
  question: string,
  profile: UserProfile | null,
  plan: WorkoutPlan
): Promise<string> {
  const context = `
Você é um coach premium de treino.
Perfil: ${profile ? JSON.stringify(profile) : 'não informado'}
Plano atual: ${plan.planName}
Objetivo: ${plan.goalDescription}
Dias: ${plan.days.map(day => `${day.dayName}: ${day.focus}`).join(' | ')}
Pergunta do aluno: ${question}

Responda em português do Brasil, de forma objetiva, técnica e prática.
`;

  const response = await getCoachClient().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: context,
  });

  return response.text || 'Não consegui responder agora.';
}
