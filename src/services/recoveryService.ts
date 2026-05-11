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

function averageSoreness(checkin: DailyCheckin): number {
  const values = Object.values(checkin.sorenessMap);
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function listSoreRegions(sorenessMap: Record<string, number>, min = 4): string[] {
  return Object.entries(sorenessMap)
    .filter(([, value]) => value >= min)
    .sort((a, b) => b[1] - a[1])
    .map(([region, value]) => `${region} (${value}/10)`);
}

function fallbackActiveRest(checkin: DailyCheckin): string {
  const soreRegions = listSoreRegions(checkin.sorenessMap, 5);
  const lowRecovery = checkin.sleepHours < 6 || checkin.energyLevel <= 4 || checkin.stressLevel >= 8;
  const duration = lowRecovery ? '20-30 min' : '30-45 min';
  const intensity = lowRecovery ? 'zona muito leve, sem ficar ofegante' : 'zona leve, mantendo conversa';

  return [
    `Descanso ativo recomendado: ${duration} em ${intensity}.`,
    soreRegions.length
      ? `Evite carregar as regiões mais sensíveis hoje: ${soreRegions.slice(0, 4).join(', ')}.`
      : 'Sem dor muscular relevante registrada; caminhada, bike leve ou mobilidade geral são boas escolhas.',
    checkin.stressLevel >= 7 ? 'Inclua 5 min de respiração nasal ou alongamento leve no final.' : 'Finalize com mobilidade confortável e hidratação.',
  ].join('\n');
}

function fallbackMobility(sorenessMap: Record<string, number>): string {
  const regions = listSoreRegions(sorenessMap, 4);
  if (!regions.length) {
    return [
      'Rotina de mobilidade geral:',
      '- 90/90 de quadril: 2x45s por lado',
      '- Mobilidade torácica em quatro apoios: 2x8 por lado',
      '- Alongamento de panturrilha: 2x30s por lado',
      '- Respiração profunda em decúbito: 2 min',
    ].join('\n');
  }

  return [
    `Foco de mobilidade: ${regions.slice(0, 4).join(', ')}.`,
    '- Use amplitude sem dor aguda e mantenha intensidade leve.',
    '- Faça 2-3 blocos de 45s por região sensível.',
    '- Se a dor passar de 7/10 ou alterar o padrão de movimento, troque treino por recuperação ativa.',
  ].join('\n');
}

function fallbackPostWorkoutProtocol(plan: WorkoutPlan, checkin: DailyCheckin): string {
  const readinessLow = checkin.sleepHours < 6 || checkin.energyLevel <= 4 || averageSoreness(checkin) >= 6;
  const focus = plan.days[0]?.focus || plan.planName;

  return [
    `Protocolo pós-treino para ${focus}:`,
    '0-30 min: 5-8 min de desaceleração, respiração nasal e mobilidade leve da cadeia treinada.',
    readinessLow
      ? '2-4h: priorize refeição com proteína completa, carboidrato moderado e evite atividade extra intensa.'
      : '2-4h: refeição com proteína completa, carboidrato conforme fome/volume e água com eletrólitos se houve muito suor.',
    `Noite: buscar ${checkin.sleepGoalHours}h de sono, luz baixa e rotina previsível.`,
    'Próximo treino: reavaliar dor por região antes de aumentar carga ou volume.',
  ].join('\n');
}

function fallbackVolumeReduction(checkins: DailyCheckin[], profile: UserProfile): string {
  const recent = checkins.slice(-7);
  if (recent.length < 3) {
    return 'Ainda há poucos check-ins para reduzir volume com confiança. Mantenha volume planejado e registre mais 3-4 dias.';
  }

  const avgSleep = recent.reduce((sum, item) => sum + item.sleepHours, 0) / recent.length;
  const avgStress = recent.reduce((sum, item) => sum + item.stressLevel, 0) / recent.length;
  const avgEnergy = recent.reduce((sum, item) => sum + item.energyLevel, 0) / recent.length;
  const highPainDays = recent.filter(item => Object.values(item.sorenessMap).some(value => value >= 7)).length;
  const critical = avgSleep < 6 || avgStress >= 7 || avgEnergy <= 4 || highPainDays >= 3;

  if (!critical) {
    return `Manter volume atual para ${profile.goal}. Sinais recentes não pedem deload automático.`;
  }

  return [
    'Semana crítica detectada: recomendo reduzir volume por 5-7 dias.',
    `Ajuste: cortar 25-35% das séries, evitar falha e manter RPE 6-7.`,
    highPainDays >= 3 ? 'Priorize descanso das regiões que bateram 7/10 de dor muscular.' : 'Mantenha técnica e remova técnicas intensificadoras.',
    `Motivo: sono médio ${avgSleep.toFixed(1)}h, estresse ${avgStress.toFixed(1)}/10, energia ${avgEnergy.toFixed(1)}/10.`,
  ].join('\n');
}

function fallbackIntensityAdjustment(plan: WorkoutPlan, readiness: ReadinessScore): string {
  const reduction = 100 - readiness.adjustedIntensity;
  const exerciseNames = plan.days[0]?.exercises.map(exercise => exercise.name).slice(0, 6) ?? [];

  return [
    `Intensidade do dia: ${readiness.adjustedIntensity}% (${readiness.label}).`,
    reduction > 0
      ? `Reduza carga alvo em aproximadamente ${Math.max(5, Math.round(reduction / 2))}% e evite séries até a falha.`
      : 'Pode seguir o treino completo, mantendo técnica e RPE planejado.',
    exerciseNames.length
      ? `Aplicar nos exercícios principais: ${exerciseNames.join(', ')}.`
      : 'Aplicar nos exercícios principais do treino atual.',
    readiness.score < 50 ? 'Se houver dor articular ou energia muito baixa, trocar por recuperação ativa.' : 'Reavalie após o aquecimento antes de subir carga.',
  ].join('\n');
}

export async function generateActiveRestRecommendation(checkin: DailyCheckin): Promise<string> {
  const prompt = `
Baseado neste check-in do dia, recomende atividades de descanso ativo:
${JSON.stringify(checkin, null, 2)}

Sugira caminhada, mobilidade, alongamento, natação leve ou yoga conforme dor, energia e estresse.
Responda em tópicos práticos, em português do Brasil.
`;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text || fallbackActiveRest(checkin);
  } catch {
    return fallbackActiveRest(checkin);
  }
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

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text || fallbackMobility(sorenessMap);
  } catch {
    return fallbackMobility(sorenessMap);
  }
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

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text || fallbackPostWorkoutProtocol(plan, checkin);
  } catch {
    return fallbackPostWorkoutProtocol(plan, checkin);
  }
}

export async function generateVolumeReductionAdvice(checkins: DailyCheckin[], profile: UserProfile): Promise<string> {
  const prompt = `
Analise os check-ins e sugira redução de volume se necessário.

Perfil: ${profile.goal}, ${profile.experienceLevel}
Check-ins recentes: ${JSON.stringify(checkins.slice(-5), null, 2)}

Indique: reduzir/manter volume, quais grupos musculares priorizar descanso, por quantos dias.
`;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text || fallbackVolumeReduction(checkins, profile);
  } catch {
    return fallbackVolumeReduction(checkins, profile);
  }
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

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text || fallbackIntensityAdjustment(plan, readiness);
  } catch {
    return fallbackIntensityAdjustment(plan, readiness);
  }
}
