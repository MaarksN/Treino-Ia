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
import {
  AbandonmentRiskContract,
  AdvancedMethodsRecommendation,
  AiDecisionAudit,
  AiStructuredResponse,
  DayVariationAdvice,
  DeloadAdvice,
  ExerciseAlternativesAdvice,
  GeneratedWorkoutFromAnamnesis,
  IdealFrequencyRecommendation,
  LoadProgressionAdvice,
  PlateauPrediction,
  SleepStressAdjustment,
  WeeklyInsightsContract,
  WeeklyPlanAdaptation,
  WeeklyVolumeRecommendation,
} from '../types/aiPersonalization';
import {
  buildDayVariationGuardrails,
  computeDeterministicFlags,
  DeterministicFlags,
  enforceTrainingGuardrails,
  listDeterministicFlagLabels,
  validateAvailableMinutes,
} from '../utils/personalizationRules';
import {
  isAbandonmentRiskContract,
  isAdvancedMethodsRecommendation,
  isDayVariationAdvice,
  isDeloadAdvice,
  isExerciseAlternativesAdvice,
  isGeneratedWorkoutFromAnamnesis,
  isIdealFrequencyRecommendation,
  isLoadProgressionAdvice,
  isPlateauPrediction,
  isSleepStressAdjustment,
  isWeeklyInsightsContract,
  isWeeklyPlanAdaptation,
  isWeeklyVolumeRecommendation,
  safeParseAiJson,
  TypeGuard,
} from '../utils/aiResponseValidation';
import { createGeminiProxyClient } from './geminiProxyClient';

const MODEL = 'gemini-2.5-pro';

const decisionAudits: AiDecisionAudit[] = [];

function getAI() {
  return createGeminiProxyClient();
}

function recordAudit(audit: AiDecisionAudit) {
  decisionAudits.push(audit);
  if (decisionAudits.length > 250) decisionAudits.shift();
}

export function getAiPersonalizationDecisionAudits(): AiDecisionAudit[] {
  return [...decisionAudits];
}

function createAudit(
  feature: string,
  flags: string[],
  usedAi: boolean,
  usedDeterministicFallback: boolean,
  validationStatus: AiDecisionAudit['validationStatus'],
  reason: string
): AiDecisionAudit {
  const audit = {
    feature,
    usedAi,
    usedDeterministicFallback,
    deterministicFlags: flags,
    validationStatus,
    reason,
    createdAt: new Date().toISOString(),
  };
  recordAudit(audit);
  return audit;
}

function parseJSON<T>(text: string | undefined, fallback: T): T {
  try {
    return JSON.parse(text || '') as T;
  } catch {
    return fallback;
  }
}

async function generateStructured<T>(
  feature: string,
  prompt: string,
  guard: TypeGuard<T>,
  fallback: T,
  flagLabels: string[],
  normalize: (value: T) => T = value => value
): Promise<AiStructuredResponse<T>> {
  const strictPrompt = `${prompt}

Responda SOMENTE com JSON valido, sem markdown e sem texto fora do JSON.
Use exatamente o contrato solicitado.`;

  try {
    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: strictPrompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = safeParseAiJson(response.text, guard);
    if (parsed.ok && parsed.value) {
      return {
        data: normalize(parsed.value),
        audit: createAudit(feature, flagLabels, true, false, 'valid', 'Resposta IA validada contra contrato estruturado.'),
      };
    }

    return {
      data: normalize(fallback),
      audit: createAudit(feature, flagLabels, false, true, parsed.reason, 'Resposta IA inválida; fallback determinístico aplicado.'),
    };
  } catch (error) {
    return {
      data: normalize(fallback),
      audit: createAudit(
        feature,
        flagLabels,
        false,
        true,
        'error',
        error instanceof Error ? error.message : 'Falha desconhecida ao chamar IA.'
      ),
    };
  }
}

function profileFallback(profile?: Partial<UserProfile>): UserProfile {
  return {
    age: profile?.age || 30,
    gender: profile?.gender || 'Não informado',
    weight: profile?.weight || 75,
    height: profile?.height || 175,
    experienceLevel: profile?.experienceLevel || 'Intermediário',
    goal: profile?.goal || 'Hipertrofia',
    daysPerWeek: profile?.daysPerWeek || 4,
    injuries: profile?.injuries || '',
    equipment: profile?.equipment,
    sleepHours: profile?.sleepHours,
    stressLevel: profile?.stressLevel,
  };
}

function latestRecovery(sessions: WorkoutSession[]): RecoveryCheckin | undefined {
  return [...sessions].reverse().find(session => session.readiness)?.readiness;
}

function baseFlags(profile: UserProfile, sessions: WorkoutSession[], recovery?: RecoveryCheckin): DeterministicFlags {
  return computeDeterministicFlags(profile, sessions, recovery || latestRecovery(sessions));
}

function flattenExercises(plan: WorkoutPlan): string[] {
  return plan.days.flatMap(day => day.exercises.map(exercise => exercise.name)).filter(Boolean);
}

function fallbackGeneratedWorkout(profile: UserProfile, flags: DeterministicFlags): GeneratedWorkoutFromAnamnesis {
  return {
    split: `${flags.recommendedFrequency} dias por semana com foco em ${profile.goal}`,
    dayFocus: ['Base técnica', 'Progressão controlada', 'Recuperação monitorada'],
    weeklyVolume: flags.lowRecovery ? 'Volume reduzido até recuperação normalizar.' : 'Volume moderado, ajustado por resposta semanal.',
    idealFrequency: flags.recommendedFrequency,
    safetyNotes: flags.painOrLimitation ? ['Evitar padrões que agravem dor ou limitação informada.'] : ['Manter RPE controlado nas primeiras semanas.'],
    initialProgression: 'Aumentar carga somente quando reps alvo forem concluídas com técnica estável.',
    summary: 'Plano estruturado por regras locais enquanto a resposta IA não estiver disponível ou validada.',
  };
}

function fallbackWeeklyAdaptation(flags: DeterministicFlags): WeeklyPlanAdaptation {
  return enforceTrainingGuardrails({
    changes: flags.deloadNeeded ? ['Reduzir volume da próxima semana e remover técnicas intensificadoras.'] : ['Manter progressão gradual e monitorar RPE.'],
    volumeAdjustment: flags.lowRecovery || flags.deloadNeeded ? 'reduce' : 'maintain',
    intensityAdjustment: flags.lowRecovery || flags.deloadNeeded ? 'reduce' : 'maintain',
    safetyNotes: [],
    summary: flags.deloadNeeded ? 'Adaptação conservadora por sinais de fadiga/recuperação.' : 'Adaptação conservadora por contrato local.',
  }, flags);
}

function fallbackLoadProgression(plan: WorkoutPlan, flags: DeterministicFlags): LoadProgressionAdvice {
  const action = flags.lowRecovery || flags.deloadNeeded ? 'reduce' : 'maintain';
  return {
    items: flattenExercises(plan).slice(0, 8).map(exercise => ({
      exercise,
      action,
      adjustment: action === 'reduce' ? 'Reduzir 5-10% ou 1 serie.' : 'Manter carga ate completar reps alvo com RPE controlado.',
      reason: flags.deloadNeeded ? 'Fadiga/recuperação pedem progressão conservadora.' : 'Sem evidência validada para aumento agressivo.',
    })),
    summary: 'Progressão segura baseada em regras determinísticas.',
  };
}

function fallbackPlateau(plan: WorkoutPlan, flags: DeterministicFlags): PlateauPrediction {
  return {
    risk: flags.plateauRisk,
    plateauDetected: flags.plateauRisk === 'alto',
    stagnantExercises: flags.plateauRisk === 'alto' ? flattenExercises(plan).slice(0, 3) : [],
    probableCause: flags.plateauRisk === 'alto' ? 'Histórico recente com pouca variação de volume.' : 'Sem platô determinístico forte.',
    suggestedAction: flags.plateauRisk === 'alto' ? 'Aplicar microvariação de volume, repetições ou exercício por 1-2 semanas.' : 'Continuar monitorando carga, reps e RPE.',
    summary: 'Predição calculada com histórico local e fallback seguro.',
  };
}

function fallbackDeload(flags: DeterministicFlags): DeloadAdvice {
  return {
    needed: flags.deloadNeeded || flags.highFatigue,
    signals: [
      ...(flags.highFatigue ? ['Fadiga alta detectada.'] : []),
      ...(flags.lowRecovery ? ['Recuperação baixa detectada.'] : []),
      ...(flags.poorSleepOrStress ? ['Sono/estresse ruins detectados.'] : []),
    ],
    nextWeekAdjustment: flags.deloadNeeded ? 'Reduzir volume e intensidade por 5-7 dias.' : 'Manter treino e reavaliar sinais na próxima sessão.',
    volumeReductionPercent: flags.deloadNeeded ? 35 : 0,
    intensityReductionPercent: flags.deloadNeeded ? 10 : 0,
    summary: flags.deloadNeeded ? 'Deload recomendado por guardrail determinístico.' : 'Deload não obrigatório pelos dados locais.',
  };
}

function fallbackExerciseAlternatives(exerciseName: string, equipment: string, injuries: string): ExerciseAlternativesAdvice {
  const hasLimitation = injuries.trim().length > 0 && !['nenhuma', 'sem', 'nao', 'não'].includes(injuries.trim().toLowerCase());
  return {
    byEquipment: [
      { name: `${exerciseName} com equipamento disponível`, reason: `Adaptado para ${equipment || 'peso corporal/equipamento informado'}.`, safetyNote: 'Manter amplitude sem dor.' },
      { name: `Variação unilateral de ${exerciseName}`, reason: 'Permite menor carga absoluta e mais controle.', safetyNote: 'Usar cadência controlada.' },
    ],
    byPainOrLimitation: hasLimitation
      ? [{ name: `Alternativa sem dor para ${exerciseName}`, reason: `Limitação informada: ${injuries}.`, safetyNote: 'Interromper se houver dor aguda ou irradiação.' }]
      : [],
    summary: hasLimitation ? 'Substituição segura priorizada por dor/limitação.' : 'Substituições seguras por equipamento.',
  };
}

function fallbackWeeklyVolume(profile: UserProfile): WeeklyVolumeRecommendation {
  const base = profile.experienceLevel.toLowerCase().includes('inic') ? 8 : 12;
  return {
    muscleGroups: ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bracos'].map(group => ({
      group,
      weeklySets: base,
      reason: 'Marco conservador para MVP privado, ajustável por recuperação e aderência.',
    })),
    summary: 'Volume semanal estruturado por nível e segurança.',
  };
}

function fallbackAdvancedMethods(profile: UserProfile): AdvancedMethodsRecommendation {
  const advanced = profile.experienceLevel.toLowerCase().includes('av');
  return {
    methods: advanced
      ? [
          { name: 'Rest-pause', applyTo: 'Exercícios acessórios estáveis.', caution: 'Evitar em semanas de fadiga alta.' },
          { name: 'Drop set', applyTo: 'Última série de isoladores.', caution: 'Não usar em movimentos com dor.' },
        ]
      : [{ name: 'Progressão dupla', applyTo: 'Exercícios principais.', caution: 'Priorizar técnica antes de intensidade avançada.' }],
    summary: advanced ? 'Métodos avançados liberados com cautela.' : 'Métodos conservadores por nível de experiência.',
  };
}

function fallbackIdealFrequency(profile: UserProfile, flags: DeterministicFlags): IdealFrequencyRecommendation {
  return {
    daysPerWeek: flags.recommendedFrequency,
    rationale: 'Frequência limitada por disponibilidade, aderência e recuperação.',
    recoveryNotes: flags.deloadNeeded ? ['Reduzir uma sessão nesta semana ou trocar por recuperação ativa.'] : ['Reavaliar semanalmente por sono, estresse e RPE.'],
    summary: `${flags.recommendedFrequency} dias/semana é a recomendação segura para ${profile.goal}.`,
  };
}

function fallbackSleepStress(sleepHours: string, stressLevel: string): SleepStressAdjustment {
  const sleep = Number.parseFloat(sleepHours.replace(',', '.'));
  const stress = Number.parseFloat(stressLevel.replace(',', '.'));
  const poor = (Number.isFinite(sleep) && sleep < 6) || /alto|alta|ruim/i.test(stressLevel) || (Number.isFinite(stress) && stress >= 8);
  return {
    intensityAdjustment: poor ? 'reduce' : 'maintain',
    volumeAdjustment: poor ? 'reduce' : 'maintain',
    aggressiveness: poor ? 'conservative' : 'normal',
    notes: poor ? ['Sono/estresse ruins: reduzir agressividade do treino hoje.'] : ['Sono/estresse sem alerta crítico informado.'],
    summary: poor ? 'Ajuste conservador aplicado por guardrail de sono/estresse.' : 'Treino mantido com monitoramento normal.',
  };
}

function fallbackWeeklyInsights(flags: DeterministicFlags): WeeklyInsightsContract {
  return {
    consistency: flags.adherenceRisk === 'alto' ? 'Consistência baixa nos registros recentes.' : 'Consistência sem alerta crítico.',
    fatigue: flags.deloadNeeded ? 'Fadiga/recuperação pedem redução temporária.' : 'Fadiga sem sinal crítico.',
    progress: flags.plateauRisk === 'alto' ? 'Possível platô no histórico recente.' : 'Progressão deve seguir controlada.',
    adherence: flags.adherenceRisk,
    nextWeekRecommendation: flags.deloadNeeded ? 'Semana conservadora com menor volume.' : 'Manter plano e registrar sessões.',
    alerts: listDeterministicFlagLabels(flags),
    summary: 'Insights estruturados por fallback determinístico.',
  };
}

function fallbackAbandonmentRisk(flags: DeterministicFlags): AbandonmentRiskContract {
  return {
    risk: flags.adherenceRisk,
    signals: flags.adherenceRisk === 'alto' ? ['Baixo número de sessões recentes registradas.'] : ['Sem alerta alto de abandono.'],
    recommendedAction: flags.adherenceRisk === 'alto' ? 'Reduzir fricção: treino mais curto e meta mínima semanal.' : 'Manter acompanhamento semanal.',
    alert: flags.adherenceRisk === 'alto' ? 'ALERTA: risco alto de abandono.' : '',
    summary: `Risco de abandono ${flags.adherenceRisk} calculado por regras locais.`,
  };
}

function dayVariationFallback(plan: WorkoutPlan, context: string, recovery?: RecoveryCheckin): DayVariationAdvice {
  const minutesMatch = context.match(/(\d{2,3})\s*(min|minutos)/i);
  const availableMinutes = minutesMatch ? Number(minutesMatch[1]) : 45;
  const guardrails = buildDayVariationGuardrails({
    availableMinutes,
    recovery,
    equipment: context.includes('casa') ? 'peso corporal' : 'equipamento disponível',
  });
  return {
    ...guardrails,
    variations: flattenExercises(plan).slice(0, 4).map(exercise => `${exercise}: manter padrão, reduzir séries se necessário.`),
    summary: 'Variação do dia respeitando tempo, recuperação e equipamento informado.',
  };
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
  const flags = baseFlags(profile, sessions);
  return generateStructured(
    'generateAdvancedWorkoutPlan',
    `Crie uma orientação avançada para gerar um plano de treino com base na anamnese.
Contrato JSON: {"split":string,"dayFocus":string[],"weeklyVolume":string,"idealFrequency":number,"safetyNotes":string[],"initialProgression":string,"summary":string}
PERFIL: ${JSON.stringify(profile)}
HISTORICO_RECENTE: ${JSON.stringify(sessions.slice(-5))}`,
    isGeneratedWorkoutFromAnamnesis,
    fallbackGeneratedWorkout(profile, flags),
    listDeterministicFlagLabels(flags),
    value => ({ ...value, idealFrequency: flags.recommendedFrequency })
  );
}

export async function adaptWeeklyPlan(plan: WorkoutPlan, sessions: WorkoutSession[]) {
  const profile = profileFallback({ daysPerWeek: plan.days.length });
  const flags = baseFlags(profile, sessions);
  return generateStructured(
    'adaptWeeklyPlan',
    `Adapte o plano semanal com base nas sessões concluídas.
Contrato JSON: {"changes":string[],"volumeAdjustment":"increase|maintain|reduce","intensityAdjustment":"increase|maintain|reduce","safetyNotes":string[],"summary":string}
PLANO: ${JSON.stringify(plan)}
SESSOES: ${JSON.stringify(sessions.slice(-7))}`,
    isWeeklyPlanAdaptation,
    fallbackWeeklyAdaptation(flags),
    listDeterministicFlagLabels(flags),
    value => enforceTrainingGuardrails(value, flags)
  );
}

export async function generateLoadProgressionAdvice(plan: WorkoutPlan, sessions: WorkoutSession[]) {
  const flags = baseFlags(profileFallback({ daysPerWeek: plan.days.length }), sessions);
  return generateStructured(
    'generateLoadProgressionAdvice',
    `Analise cargas, reps, RPE e feedbacks e recomende progressão por exercício.
Contrato JSON: {"items":[{"exercise":string,"action":"increase|maintain|reduce|swap","adjustment":string,"reason":string}],"summary":string}
PLANO: ${JSON.stringify(plan)}
SESSOES: ${JSON.stringify(sessions.slice(-10))}`,
    isLoadProgressionAdvice,
    fallbackLoadProgression(plan, flags),
    listDeterministicFlagLabels(flags),
    value => flags.lowRecovery || flags.deloadNeeded
      ? { ...value, items: value.items.map(item => ({ ...item, action: item.action === 'increase' ? 'maintain' : item.action })) }
      : value
  );
}

export async function predictPlateau(plan: WorkoutPlan, sessions: WorkoutSession[]) {
  const flags = baseFlags(profileFallback({ daysPerWeek: plan.days.length }), sessions);
  return generateStructured(
    'predictPlateau',
    `Avalie risco de plato com base no historico.
Contrato JSON: {"risk":"baixo|medio|alto","plateauDetected":boolean,"stagnantExercises":string[],"probableCause":string,"suggestedAction":string,"summary":string}
PLANO: ${JSON.stringify(plan)}
SESSOES: ${JSON.stringify(sessions.slice(-12))}`,
    isPlateauPrediction,
    fallbackPlateau(plan, flags),
    listDeterministicFlagLabels(flags),
    value => flags.plateauRisk === 'alto' ? { ...value, risk: 'alto' as const, plateauDetected: true } : value
  );
}

export async function generateDeloadAdvice(plan: WorkoutPlan, sessions: WorkoutSession[]) {
  const flags = baseFlags(profileFallback({ daysPerWeek: plan.days.length }), sessions);
  return generateStructured(
    'generateDeloadAdvice',
    `Avalie necessidade de deload por fadiga, RPE, dor e aderência.
Contrato JSON: {"needed":boolean,"signals":string[],"nextWeekAdjustment":string,"volumeReductionPercent":number,"intensityReductionPercent":number,"summary":string}
PLANO: ${JSON.stringify(plan)}
SESSOES: ${JSON.stringify(sessions.slice(-10))}`,
    isDeloadAdvice,
    fallbackDeload(flags),
    listDeterministicFlagLabels(flags),
    value => flags.deloadNeeded ? { ...value, needed: true, volumeReductionPercent: Math.max(value.volumeReductionPercent, 30) } : value
  );
}

export async function suggestExerciseAlternatives(exerciseName: string, equipment: string, injuries: string) {
  const flagLabels = injuries.trim() ? ['pain_or_limitation_safe_swap'] : [];
  return generateStructured(
    'suggestExerciseAlternatives',
    `Sugira substituições inteligentes para o exercício informado.
Contrato JSON: {"byEquipment":[{"name":string,"reason":string,"safetyNote":string}],"byPainOrLimitation":[{"name":string,"reason":string,"safetyNote":string}],"summary":string}
EXERCICIO: ${exerciseName}
EQUIPAMENTOS: ${equipment || 'nao informado'}
LESOES_LIMITACOES: ${injuries || 'nenhuma'}`,
    isExerciseAlternativesAdvice,
    fallbackExerciseAlternatives(exerciseName, equipment, injuries),
    flagLabels
  );
}

export async function askAiCoach(question: string, profile: UserProfile, plan: WorkoutPlan, sessions: WorkoutSession[]) {
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

export async function generatePremiumPostWorkoutFeedback(session: WorkoutSession, plan: WorkoutPlan): Promise<AiFeedback> {
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
    required: ['overallAssessment', 'strengths', 'improvements', 'nextStepTips', 'motivationalNote', 'progressIndicator'],
  };

  const response = await getAI().models.generateContent({
    model: MODEL,
    contents: `Analise esta sessão finalizada e gere uma devolutiva premium.
PLANO: ${JSON.stringify(plan)}
SESSAO: ${JSON.stringify(session)}`,
    config: { responseMimeType: 'application/json', responseSchema: schema },
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
  const flags = baseFlags(profile, []);
  return generateStructured(
    'recommendWeeklyVolume',
    `Sugira volume semanal por grupo muscular.
Contrato JSON: {"muscleGroups":[{"group":string,"weeklySets":number,"reason":string}],"summary":string}
PERFIL: ${JSON.stringify(profile)}`,
    isWeeklyVolumeRecommendation,
    fallbackWeeklyVolume(profile),
    listDeterministicFlagLabels(flags)
  );
}

export async function adjustWorkoutForAvailableTime(plan: WorkoutPlan, availableMinutes: number) {
  const boundedMinutes = validateAvailableMinutes(availableMinutes);
  return `Ajuste determinístico para ${boundedMinutes} min: priorize exercícios principais, reduza acessórios e mantenha técnica/RPE controlados.`;
}

export async function adjustWorkoutForRecovery(plan: WorkoutPlan, recovery: RecoveryCheckin) {
  const flags = baseFlags(profileFallback({ daysPerWeek: plan.days.length }), [], recovery);
  const advice = fallbackWeeklyAdaptation(flags);
  return `${advice.summary}\n${advice.safetyNotes.join('\n')}`;
}

export async function generateMacrocycle(profile: UserProfile): Promise<MacrocyclePhase[]> {
  const response = await getAI().models.generateContent({
    model: MODEL,
    contents: `Crie um macrociclo anual de treino para este perfil: ${JSON.stringify(profile)}`,
    config: { responseMimeType: 'application/json', responseSchema: macrocycleSchema },
  });

  return parseJSON<MacrocyclePhase[]>(response.text, []);
}

export async function generateMicrocycles(profile: UserProfile, goal: string): Promise<Microcycle[]> {
  const response = await getAI().models.generateContent({
    model: MODEL,
    contents: `Crie 4 microciclos para o objetivo "${goal}" considerando: ${JSON.stringify(profile)}`,
    config: { responseMimeType: 'application/json', responseSchema: microcycleSchema },
  });

  return parseJSON<Microcycle[]>(response.text, []);
}

export async function suggestAdvancedMethods(profile: UserProfile) {
  const flags = baseFlags(profile, []);
  return generateStructured(
    'suggestAdvancedMethods',
    `Sugira métodos avançados adequados para este perfil.
Contrato JSON: {"methods":[{"name":string,"applyTo":string,"caution":string}],"summary":string}
PERFIL: ${JSON.stringify(profile)}`,
    isAdvancedMethodsRecommendation,
    fallbackAdvancedMethods(profile),
    listDeterministicFlagLabels(flags)
  );
}

export async function recommendIdealFrequency(profile: UserProfile) {
  const flags = baseFlags(profile, []);
  return generateStructured(
    'recommendIdealFrequency',
    `Recomende frequência ideal de treino por semana.
Contrato JSON: {"daysPerWeek":number,"rationale":string,"recoveryNotes":string[],"summary":string}
PERFIL: ${JSON.stringify(profile)}`,
    isIdealFrequencyRecommendation,
    fallbackIdealFrequency(profile, flags),
    listDeterministicFlagLabels(flags),
    value => ({ ...value, daysPerWeek: flags.recommendedFrequency })
  );
}

export async function adjustBySleepAndStress(plan: WorkoutPlan, sleepHours: string, stressLevel: string) {
  const fallback = fallbackSleepStress(sleepHours, stressLevel);
  const flagLabels = fallback.aggressiveness === 'conservative' ? ['poor_sleep_or_stress_reduce_aggressiveness'] : [];
  return generateStructured(
    'adjustBySleepAndStress',
    `Ajuste o treino por sono e estresse.
Contrato JSON: {"intensityAdjustment":"maintain|reduce","volumeAdjustment":"maintain|reduce","aggressiveness":"normal|conservative","notes":string[],"summary":string}
SONO: ${sleepHours}
ESTRESSE: ${stressLevel}
PLANO: ${JSON.stringify(plan)}`,
    isSleepStressAdjustment,
    fallback,
    flagLabels,
    value => fallback.aggressiveness === 'conservative'
      ? { ...value, intensityAdjustment: 'reduce' as const, volumeAdjustment: 'reduce' as const, aggressiveness: 'conservative' as const }
      : value
  );
}

export async function generateWeeklyAiInsights(profile: UserProfile, sessions: WorkoutSession[]) {
  const flags = baseFlags(profile, sessions);
  return generateStructured(
    'generateWeeklyAiInsights',
    `Gere relatório semanal com insights estruturados.
Contrato JSON: {"consistency":string,"fatigue":string,"progress":string,"adherence":string,"nextWeekRecommendation":string,"alerts":string[],"summary":string}
PERFIL: ${JSON.stringify(profile)}
SESSOES: ${JSON.stringify(sessions.slice(-7))}`,
    isWeeklyInsightsContract,
    fallbackWeeklyInsights(flags),
    listDeterministicFlagLabels(flags)
  );
}

export async function detectRiskOfAbandonment(profile: UserProfile, sessions: WorkoutSession[]) {
  const flags = baseFlags(profile, sessions);
  return generateStructured(
    'detectRiskOfAbandonment',
    `Analise risco de inconsistencia ou abandono.
Contrato JSON: {"risk":"baixo|medio|alto","signals":string[],"recommendedAction":string,"alert":string,"summary":string}
SINAL_DETERMINISTICO: ${flags.adherenceRisk}
SESSOES: ${JSON.stringify(sessions.slice(-14))}`,
    isAbandonmentRiskContract,
    fallbackAbandonmentRisk(flags),
    listDeterministicFlagLabels(flags),
    value => flags.adherenceRisk === 'alto' ? { ...value, risk: 'alto' as const, alert: value.alert || 'ALERTA: risco alto de abandono.' } : value
  );
}

export async function generateDayVariations(plan: WorkoutPlan, context: string, recovery?: RecoveryCheckin) {
  const fallback = dayVariationFallback(plan, context, recovery);
  return generateStructured(
    'generateDayVariations',
    `Gere variações inteligentes para o treino do dia.
Contrato JSON: {"availableMinutes":number,"equipment":string[],"volumeAdjustment":"maintain|reduce","intensityAdjustment":"maintain|reduce","variations":string[],"safetyNotes":string[],"summary":string}
CONTEXTO: ${context}
GUARDRAILS: ${JSON.stringify(fallback)}
PLANO: ${JSON.stringify(plan)}`,
    isDayVariationAdvice,
    fallback,
    fallback.safetyNotes,
    value => ({
      ...value,
      availableMinutes: fallback.availableMinutes,
      equipment: fallback.equipment,
      volumeAdjustment: fallback.volumeAdjustment === 'reduce' ? 'reduce' : value.volumeAdjustment,
      intensityAdjustment: fallback.intensityAdjustment === 'reduce' ? 'reduce' : value.intensityAdjustment,
      safetyNotes: Array.from(new Set([...fallback.safetyNotes, ...value.safetyNotes])),
    })
  );
}
