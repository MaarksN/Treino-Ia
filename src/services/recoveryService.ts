import { DailyCheckin, ReadinessScore, RecoveryCheckin, UserProfile, WorkoutPlan } from '../types';
import { createGeminiProxyClient } from './geminiProxyClient';

function getAI() {
  return createGeminiProxyClient();
}

export function getRecoveryScore(checkin: RecoveryCheckin) {
  const sleepScore = Math.min(checkin.sleepHours, 8) * 10;
  const sorenessPenalty = checkin.sorenessLevel * 5;
  const stressPenalty = checkin.stressLevel * 4;
  const energyScore = checkin.energyLevel * 8;
  const score = Math.max(0, Math.min(100, sleepScore + energyScore - sorenessPenalty - stressPenalty));

  if (score >= 70) return { score, label: 'Alta', modifier: 'normal' as const };
  if (score >= 45) return { score, label: 'Média', modifier: 'reduced' as const };
  return { score, label: 'Baixa', modifier: 'light' as const };
}

export async function generateActiveRestRecommendation(checkin: DailyCheckin): Promise<string> {
  const prompt = `
Baseado neste check-in do dia, recomende atividades de descanso ativo:
${JSON.stringify(checkin, null, 2)}

Sugira caminhada, mobilidade, alongamento, natação leve ou yoga conforme dor, energia e estresse.
Responda em tópicos práticos, em português do Brasil.
`;

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  return response.text || 'Sem recomendação.';
}

export async function generateMobilityRecommendation(sorenessMap: Record<string, number>): Promise<string> {
  const regions = Object.entries(sorenessMap)
    .filter(([, value]) => value >= 4)
    .map(([region, value]) => `${region}: ${value}/10`)
    .join(', ');

  const prompt = `
Regiões com dor muscular: ${regions || 'nenhuma relevante'}

Gere uma rotina de mobilidade específica para essas regiões.
Inclua nome do exercício, repetições/tempo e cuidados.
`;

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  return response.text || 'Sem rotina.';
}

export async function generatePostWorkoutProtocol(plan: WorkoutPlan, checkin: DailyCheckin): Promise<string> {
  const prompt = `
Gere um protocolo pós-treino personalizado.

Treino realizado: ${plan.planName} - ${plan.days[0]?.focus || ''}
Check-in do dia: sono ${checkin.sleepHours}h, energia ${checkin.energyLevel}/10, estresse ${checkin.stressLevel}/10

Inclua:
1. Resfriamento imediato (0-30 min)
2. Próximas 2-4h
3. Noite (sono e recuperação)
4. Até o próximo treino

Responda em tópicos práticos.
`;

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  return response.text || 'Sem protocolo.';
}

export async function generateVolumeReductionAdvice(checkins: DailyCheckin[], profile: UserProfile): Promise<string> {
  const prompt = `
Analise os check-ins e sugira redução de volume se necessário.

Perfil: ${profile.goal}, ${profile.experienceLevel}
Check-ins recentes: ${JSON.stringify(checkins.slice(-5), null, 2)}

Indique: reduzir/manter volume, quais grupos musculares priorizar descanso, por quantos dias.
`;

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  return response.text || 'Sem ajuste necessário.';
}

export async function generateIntensityAdjustment(plan: WorkoutPlan, readiness: ReadinessScore): Promise<string> {
  const prompt = `
Ajuste a intensidade do treino de hoje com base na prontidão.

Prontidão: ${readiness.label} (${readiness.score}/100)
Recomendação: ${readiness.recommendation}
Intensidade sugerida: ${readiness.adjustedIntensity}%

Plano: ${plan.planName} - ${plan.days[0]?.focus || ''}
Exercícios: ${plan.days[0]?.exercises.map(exercise => exercise.name).join(', ')}

Diga como ajustar cada exercício.
`;

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
  });

  return response.text || 'Sem ajuste.';
}
