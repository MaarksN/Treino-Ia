import { Type, Schema } from "@google/genai";
import { Exercise, UserProfile, WorkoutHistoryRecord, WorkoutPlan } from "../types";
import { createGeminiProxyClient } from './geminiProxyClient';
import { captureError } from "../utils/errorTelemetry";

const LOCAL_EXERCISE_BANK = {
  gym: {
    push: [
      ['Supino Reto com Barra', 'Peito', 'Empurrar horizontal'],
      ['Supino Inclinado com Halteres', 'Peito superior', 'Empurrar inclinado'],
      ['Desenvolvimento com Halteres', 'Ombros', 'Empurrar vertical'],
      ['Elevação Lateral com Halteres', 'Ombros', 'Abdução de ombro'],
      ['Tríceps Testa com Barra EZ', 'Tríceps', 'Extensão de cotovelo'],
      ['Flexão de Braço', 'Peito', 'Empurrar horizontal'],
    ],
    pull: [
      ['Puxada Frontal na Polia', 'Costas', 'Puxar vertical'],
      ['Remada Curvada com Barra', 'Costas', 'Puxar horizontal'],
      ['Remada Unilateral com Halter', 'Costas', 'Puxar horizontal'],
      ['Face Pull na Polia', 'Ombros posteriores', 'Puxada corretiva'],
      ['Rosca Direta com Barra', 'Bíceps', 'Flexão de cotovelo'],
      ['Rosca Concentrada', 'Bíceps', 'Flexão de cotovelo'],
    ],
    legs: [
      ['Agachamento Livre', 'Quadríceps', 'Squat'],
      ['Leg Press 45°', 'Quadríceps', 'Squat machine'],
      ['Stiff com Halteres', 'Posterior de coxa', 'Hinge'],
      ['Mesa Flexora', 'Posterior de coxa', 'Flexão de joelho'],
      ['Hip Thrust com Barra', 'Glúteos', 'Extensão de quadril'],
      ['Panturrilha em Pé', 'Panturrilhas', 'Flexão plantar'],
    ],
    core: [
      ['Prancha Frontal', 'Core', 'Anti-extensão'],
      ['Abdominal Dead Bug', 'Core', 'Estabilidade lombopélvica'],
      ['Pallof Press na Polia', 'Core', 'Anti-rotação'],
    ],
  },
  bodyweight: {
    push: [
      ['Flexão de Braço', 'Peito', 'Empurrar horizontal'],
      ['Flexão Pike', 'Ombros', 'Empurrar vertical'],
      ['Mergulho no Banco', 'Tríceps', 'Extensão de cotovelo'],
      ['Flexão Diamante', 'Tríceps', 'Empurrar horizontal fechado'],
      ['Prancha com Toque no Ombro', 'Core', 'Anti-rotação'],
    ],
    pull: [
      ['Remada Invertida sob Mesa', 'Costas', 'Puxar horizontal'],
      ['Superman', 'Lombar', 'Extensão de tronco'],
      ['Y-T-W deitado', 'Ombros posteriores', 'Controle escapular'],
      ['Rosca com Mochila', 'Bíceps', 'Flexão de cotovelo'],
      ['Isometria de Dorsal com Toalha', 'Costas', 'Depressão escapular'],
    ],
    legs: [
      ['Agachamento Livre', 'Quadríceps', 'Squat'],
      ['Afundo Alternado', 'Quadríceps', 'Lunge'],
      ['Agachamento Búlgaro', 'Quadríceps', 'Squat unilateral'],
      ['Ponte de Glúteo', 'Glúteos', 'Extensão de quadril'],
      ['Mesa Flexora Deslizante com Toalha', 'Posterior de coxa', 'Flexão de joelho'],
      ['Panturrilha em Pé', 'Panturrilhas', 'Flexão plantar'],
    ],
    core: [
      ['Prancha Frontal', 'Core', 'Anti-extensão'],
      ['Dead Bug', 'Core', 'Estabilidade lombopélvica'],
      ['Mountain Climber', 'Core', 'Condicionamento'],
    ],
  },
} as const;

type LocalExerciseTuple = readonly [string, string, string];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isBodyweightProfile(profile: UserProfile) {
  const text = `${profile.workoutLocation || ''} ${profile.gymType || ''} ${profile.equipment || ''}`.toLowerCase();
  return text.includes('peso corporal') || text.includes('calistenia') || text.includes('parque');
}

function getTrainingParams(profile: UserProfile) {
  const goal = profile.goal.toLowerCase();
  const level = profile.experienceLevel.toLowerCase();
  const time = Number(profile.timePerWorkout || String(profile.sessionDuration || '').match(/\d+/)?.[0] || 60);

  if (goal.includes('força')) {
    return {
      sets: level.includes('iniciante') ? 3 : 4,
      reps: '3-6',
      rest: '120s',
      exerciseCount: time <= 35 ? 4 : time <= 60 ? 5 : 6,
      intensityNote: 'Priorize carga progressiva com técnica limpa e 1-2 repetições em reserva.',
    };
  }

  if (goal.includes('emagrecimento') || goal.includes('resistência') || goal.includes('condicionamento')) {
    return {
      sets: level.includes('iniciante') ? 2 : 3,
      reps: '12-20',
      rest: '45s',
      exerciseCount: time <= 35 ? 4 : time <= 60 ? 5 : 6,
      intensityNote: 'Mantenha ritmo alto, descanso curto e execução controlada.',
    };
  }

  return {
    sets: level.includes('iniciante') ? 3 : 4,
    reps: '8-12',
    rest: '60-90s',
    exerciseCount: time <= 35 ? 4 : time <= 60 ? 5 : 6,
    intensityNote: 'Busque sobrecarga progressiva mantendo controle total da fase excêntrica.',
  };
}

function localExerciseFromTuple(
  tuple: LocalExerciseTuple,
  params: ReturnType<typeof getTrainingParams>,
  index: number,
  profile: UserProfile
): Exercise {
  const [name, muscleGroup, movementPattern] = tuple;
  const isCoreOrConditioning = muscleGroup === 'Core' || movementPattern === 'Condicionamento';
  const reps = isCoreOrConditioning
    ? movementPattern === 'Condicionamento' ? '30-45s' : '30-60s'
    : params.reps;

  return {
    id: crypto.randomUUID(),
    name,
    sets: index === 0 && !profile.experienceLevel.toLowerCase().includes('iniciante')
      ? params.sets + 1
      : params.sets,
    reps,
    rest: isCoreOrConditioning ? '30-45s' : params.rest,
    muscleGroup,
    movementPattern,
    tags: [muscleGroup.toLowerCase(), movementPattern.toLowerCase(), profile.goal.toLowerCase()],
    executionDetails: `Execute ${name} com postura firme, amplitude segura e controle do tronco. Pare se houver dor articular e reduza a carga ou a dificuldade.`,
    concentricPhase: `Na fase de esforço, acelere com controle e contraia ${muscleGroup} sem roubar o movimento.`,
    eccentricPhase: `Na descida ou retorno, freie por 2-3 segundos para gerar tensão mecânica e proteger as articulações.`,
    notes: params.intensityNote,
  };
}

function pickLocalExercises(
  profile: UserProfile,
  groups: Array<'push' | 'pull' | 'legs' | 'core'>,
  exerciseCount: number
) {
  const bank = isBodyweightProfile(profile) ? LOCAL_EXERCISE_BANK.bodyweight : LOCAL_EXERCISE_BANK.gym;
  const picked: LocalExerciseTuple[] = [];
  let cursor = 0;

  while (picked.length < exerciseCount) {
    const group = groups[cursor % groups.length];
    const options = bank[group];
    const option = options[Math.floor(cursor / groups.length) % options.length];
    if (!picked.some(([name]) => name === option[0])) picked.push(option);
    cursor += 1;
    if (cursor > 60) break;
  }

  return picked;
}

function getSplit(daysPerWeek: number) {
  const splits: Record<number, Array<{ name: string; focus: string; groups: Array<'push' | 'pull' | 'legs' | 'core'> }>> = {
    1: [
      { name: 'Dia 1', focus: 'Full Body Essencial', groups: ['legs', 'push', 'pull', 'core'] },
    ],
    2: [
      { name: 'Dia 1', focus: 'Superiores', groups: ['push', 'pull', 'core'] },
      { name: 'Dia 2', focus: 'Inferiores', groups: ['legs', 'core'] },
    ],
    3: [
      { name: 'Dia 1', focus: 'Push', groups: ['push', 'core'] },
      { name: 'Dia 2', focus: 'Pull', groups: ['pull', 'core'] },
      { name: 'Dia 3', focus: 'Legs', groups: ['legs', 'core'] },
    ],
    4: [
      { name: 'Dia 1', focus: 'Superiores A', groups: ['push', 'pull'] },
      { name: 'Dia 2', focus: 'Inferiores A', groups: ['legs', 'core'] },
      { name: 'Dia 3', focus: 'Superiores B', groups: ['pull', 'push'] },
      { name: 'Dia 4', focus: 'Inferiores B', groups: ['legs', 'core'] },
    ],
    5: [
      { name: 'Dia 1', focus: 'Push Pesado', groups: ['push'] },
      { name: 'Dia 2', focus: 'Pull Pesado', groups: ['pull'] },
      { name: 'Dia 3', focus: 'Pernas', groups: ['legs', 'core'] },
      { name: 'Dia 4', focus: 'Superiores Volume', groups: ['push', 'pull'] },
      { name: 'Dia 5', focus: 'Inferiores e Core', groups: ['legs', 'core'] },
    ],
    6: [
      { name: 'Dia 1', focus: 'Push A', groups: ['push'] },
      { name: 'Dia 2', focus: 'Pull A', groups: ['pull'] },
      { name: 'Dia 3', focus: 'Legs A', groups: ['legs', 'core'] },
      { name: 'Dia 4', focus: 'Push B', groups: ['push', 'core'] },
      { name: 'Dia 5', focus: 'Pull B', groups: ['pull', 'core'] },
      { name: 'Dia 6', focus: 'Legs B', groups: ['legs', 'core'] },
    ],
    7: [
      { name: 'Dia 1', focus: 'Push A', groups: ['push'] },
      { name: 'Dia 2', focus: 'Pull A', groups: ['pull'] },
      { name: 'Dia 3', focus: 'Legs A', groups: ['legs', 'core'] },
      { name: 'Dia 4', focus: 'Full Body Leve', groups: ['push', 'pull', 'legs', 'core'] },
      { name: 'Dia 5', focus: 'Push B', groups: ['push', 'core'] },
      { name: 'Dia 6', focus: 'Pull B', groups: ['pull', 'core'] },
      { name: 'Dia 7', focus: 'Legs B e Mobilidade', groups: ['legs', 'core'] },
    ],
  };

  return splits[clamp(Math.round(daysPerWeek || 3), 1, 7)];
}

function generateLocalWorkoutPlan(profile: UserProfile, history?: WorkoutPlan[]): WorkoutPlan {
  const params = getTrainingParams(profile);
  const weakPoint = profile.weakPoints || profile.secondaryGoal || profile.secondaryFocus;
  const split = getSplit(profile.daysPerWeek);
  const localMode = isBodyweightProfile(profile) ? 'peso corporal' : 'academia/equipamentos';

  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    planName: `Plano ${profile.goal} - ${profile.experienceLevel}`,
    goalDescription: `Plano gerado no aparelho para ${profile.goal}, com ${profile.daysPerWeek} dia(s)/semana, foco em ${localMode}${weakPoint ? ` e atenção extra para ${weakPoint}` : ''}. ${history?.length ? 'Também considera que você já possui histórico salvo no app.' : ''}`,
    days: split.map((day, dayIndex) => {
      const exercises = pickLocalExercises(profile, day.groups, params.exerciseCount)
        .map((tuple, index) => localExerciseFromTuple(tuple, params, index, profile));

      return {
        id: crypto.randomUUID(),
        dayName: day.name,
        focus: day.focus,
        warmup: '5-8 minutos de aquecimento geral, mobilidade da articulação principal do dia e 2 séries leves do primeiro exercício.',
        cooldown: '3-5 minutos de respiração, alongamento leve dos músculos treinados e anotação de carga/repetições.',
        estimatedDuration: profile.sessionDuration || `${profile.timePerWorkout || 60} minutos`,
        exercises: dayIndex === split.length - 1 && weakPoint
          ? exercises.map((exercise, index) => index === exercises.length - 1
            ? { ...exercise, notes: `${exercise.notes} Finalize com foco extra no ponto fraco informado: ${weakPoint}.` }
            : exercise)
          : exercises,
      };
    }),
  };
}

function getAI() {
  return createGeminiProxyClient();
}

export const workoutPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    planName: {
      type: Type.STRING,
      description: "Nome motivacional ou descritivo para o plano de treino",
    },
    goalDescription: {
      type: Type.STRING,
      description: "Uma breve explicação de como esse treino atingirá o objetivo",
    },
    days: {
      type: Type.ARRAY,
      description: "Lista de dias de treino",
      items: {
        type: Type.OBJECT,
        properties: {
          dayName: {
            type: Type.STRING,
            description: "Nome do dia (ex: Dia 1, Segunda-feira, etc)",
          },
          focus: {
            type: Type.STRING,
            description: "Foco principal do dia (ex: Peito e Tríceps, Membros Inferiores, etc)",
          },
          warmup: {
            type: Type.STRING,
            description: "Rotina de aquecimento recomendada para este dia",
          },
          cooldown: {
            type: Type.STRING,
            description: "Rotina de cooldown e mobilidade após o treino",
          },
          estimatedDuration: {
            type: Type.STRING,
            description: "Duração estimada da sessão (ex: 55-70 min)",
          },
          exercises: {
            type: Type.ARRAY,
            description: "Lista de exercícios do dia",
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "Nome do exercício",
                },
                sets: {
                  type: Type.INTEGER,
                  description: "Número de séries",
                },
                reps: {
                  type: Type.STRING,
                  description: "Número de repetições (ex: 8-10, 12, Falha)",
                },
                rest: {
                  type: Type.STRING,
                  description: "Tempo de descanso (ex: 60s, 90s)",
                },
                muscleGroup: {
                  type: Type.STRING,
                  description: "Grupo muscular principal trabalhado",
                },
                movementPattern: {
                  type: Type.STRING,
                  description: "Padrão de movimento principal",
                },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Tags úteis para busca, equipamento e grupo muscular",
                },
                videoUrl: {
                  type: Type.STRING,
                  description: "URL opcional de vídeo de execução",
                },
                executionDetails: {
                  type: Type.STRING,
                  description: "Explicação detalhada de como realizar o exercício passo a passo.",
                },
                concentricPhase: {
                  type: Type.STRING,
                  description: "Explicação da fase concêntrica (explosão/contração) deste exercício e músculos envolvidos.",
                },
                eccentricPhase: {
                  type: Type.STRING,
                  description: "Explicação da fase excêntrica (alongamento/controle) deste exercício e músculos envolvidos.",
                },
                notes: {
                  type: Type.STRING,
                  description: "Dica de execução ou nota importante",
                },
              },
              required: ["name", "sets", "reps", "rest", "executionDetails", "concentricPhase", "eccentricPhase"],
            },
          },
        },
        required: ["dayName", "focus", "warmup", "cooldown", "estimatedDuration", "exercises"],
      },
    },
  },
  required: ["planName", "goalDescription", "days"],
};

export async function generateWorkoutPlan(profile: UserProfile, history?: WorkoutPlan[]): Promise<WorkoutPlan> {
  let feedbackContext = "";
  if (history && history.length > 0) {
    const recentPlan = history[0];
    const feedbacks = recentPlan.days.flatMap(d => d.exercises).filter(e => e.feedback);
    if (feedbacks.length > 0) {
      feedbackContext = "\n\nAdapte este novo treino com base no feedback fornecido no treino anterior:\n" + 
        feedbacks.map(f => {
          if (f.feedback === 'painful') return `- ${f.name}: Relatou dor (substitua por outro ou mude a mecânica).`;
          if (f.feedback === 'easy') return `- ${f.name}: Achou muito fácil (aumente a dificuldade/carga recomendada).`;
          if (f.feedback === 'hard') return `- ${f.name}: Achou muito difícil (reduza a dificuldade/carga recomendada).`;
          return '';
        }).filter(Boolean).join('\n');
    }
  }

  const sessionDuration = profile.sessionDuration || `${profile.timePerWorkout || 60} minutos`;
  const trainingEnvironment = profile.gymType || profile.workoutLocation || 'Academia';
  const availableEquipment = profile.equipment || trainingEnvironment;
  const secondaryGoal = profile.secondaryGoal || profile.secondaryFocus || 'Nenhum';

  const prompt = `ATENÇÃO: Você é a Inteligência Artificial Supremo de Treinamento, responsável por forjar atletas de elite e mudar vidas.
O usuário enviou este perfil e precisa do melhor plano de treinamento do MUNDO:
- Idade: ${profile.age} anos
- Sexo: ${profile.gender}
- Peso: ${profile.weight} kg
- Altura: ${profile.height} cm
- Percentual de gordura estimado: ${profile.bodyFatPercent || 'Não informado'}
- Experiência: ${profile.experienceLevel}
- Objetivo: ${profile.goal}
- Objetivo secundário: ${secondaryGoal}
- Dias de Treino/Semana: ${profile.daysPerWeek}
- Duração das Sessões: ${sessionDuration}
- Ambiente de Treino: ${trainingEnvironment}
- Equipamentos disponíveis: ${availableEquipment}
- Sono médio: ${profile.sleepHours || 'Não informado'}
- Estresse: ${profile.stressLevel || 'Não informado'}
- Pontos fracos: ${profile.weakPoints || 'Não informado'}
- Lesões ou Restrições: ${profile.injuries || "Nenhuma"}
-${feedbackContext}

REGRAS OBRIGATÓRIAS (FALHAR NÃO É UMA OPÇÃO):
1. EMOJIS: Toda chave JSON de string deve começar com um Emoji relevante (ex: "🚀 Nome").
2. LINGUAGEM HARDCORE: Seja brutal, científico, motivador. Fale como um mestre da hipertrofia cibernético.
3. PRECISÃO BIOMECÂNICA: 'concentricPhase' deve explicar extamente a contração máxima gerada, músculos alvo, etc. 'eccentricPhase' deve explicar como frear a carga e induzir as microlesões.
4. ADAPTAÇÃO TOTAL: Se for 'Casa (Peso Corporal)', não coloque supino com barra. Se for 20 minutos, faça um HIIT/treino metabólico intenso. Respeite as variáveis do usuário de forma divina.
5. EXECUÇÃO DIVINA: 'executionDetails' deve soar como um treinador espartano ensinando a postura perfeita.
6. JSON VALIDO: Você deve retornar o plano estritamente validado com o schema exigido.`;

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: workoutPlanSchema,
    },
  });

  const jsonStr = response.text || "{}";
  try {
    const parsed = JSON.parse(jsonStr) as WorkoutPlan;
    parsed.id = crypto.randomUUID();
    parsed.createdAt = Date.now();
    parsed.days = parsed.days.map(day => ({
      ...day,
      id: crypto.randomUUID(),
      exercises: day.exercises.map(ex => ({
        ...ex,
        id: crypto.randomUUID()
      }))
    }));
    return parsed;
  } catch (error) {
    captureError(error, 'geminiService.generateWorkoutPlan.parse');
    throw new Error("A resposta da IA veio inválida. Tente novamente.");
  }
}

export async function analyzeBodyImage(base64Image: string, mimeType: string, profile: UserProfile): Promise<string> {
  const prompt = `ATENÇÃO: Você é um Treinador Cibernético focado em hipertrofia e composição corporal.
O usuário enviou uma foto de progressão. Analise a imagem em relação ao biotipo atual (Peso: ${profile.weight}kg, Nível: ${profile.experienceLevel}).
1. Forneça uma avaliação brutalmente honesta da composição corporal projetada.
2. Identifique pontos fortes (músculos que parecem mais desenvolvidos).
3. Identifique assimetrias ou grupos musculares que precisam de foco.
4. Mantenha o formato Markdown, usando emojis e tom hardcore.
IMPORTANTE: Não dê conselhos médicos, fale estritamente como um bodybuilder avaliando um atleta.`;

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
      prompt,
    ]
  });

  return response.text || "Análise de transformação falhou.";
}

export async function analyzeFoodImage(base64Image: string, mimeType: string, profile: UserProfile): Promise<string> {
  const prompt = `Analise esta foto de refeição como um Nutricionista Clínico Esportivo impiedoso e direto.
Baseado no usuário (Peso: ${profile.weight}kg, Objetivo: ${profile.goal}):
1. Liste os alimentos identificados.
2. Estime as calorias totais e os macronutrientes (Proteínas, Carbos, Gorduras).
3. Diga se essa refeição aproxima ou afasta do objetivo do dia.

Formate em Markdown curto e grosso.`;

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
      prompt,
    ]
  });

  return response.text || "Não foi possível analisar a refeição.";
}

export async function generateWorkoutHistoryReport(workoutHistory: WorkoutHistoryRecord[]): Promise<string> {
  const prompt = `ATENÇÃO: Você é a I.A. Treinadora Supremo.
Aqui estão os registros de treino das últimas sessões do usuário. Analise os dados e gere um relatório brutal de avaliação de final de microciclo:
1. Resumo do volume.
2. Identifique sinais de PLATÔ (pouca variação de carga).
3. Identifique sinais de OVERTRAINING (exaustão marcante ou queda de reps).
4. Recomende se devemos iniciar o próximo microciclo com SOBRECARGA PROGRESSIVA pesada ou deload.

Use emojis, formato Markdown (com listas e bolds) e seja super motivacional porém técnico. Seja breve (máx 3 parágrafos).

Dados do histórico recente (apenas para contexto, não imprima o JSON na resposta):
${JSON.stringify(workoutHistory.map(r => ({ date: new Date(r.date).toISOString(), focus: r.focus, load: r.volumeLoad })).slice(0, 10))}`;

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
  });

  return response.text || "Relatório não disponível.";
}

export async function extractWorkoutFromFile(base64Data: string, mimeType: string): Promise<WorkoutPlan> {
  const prompt = `ATENÇÃO: Você é a I.A. Mestre da Forja Neural. Extraia este plano de texto/imagem e adapte para nosso ecossistema brutal.

REGRAS OBRIGATÓRIAS (FALHAR NÃO É UMA OPÇÃO):
1. EMOJIS: Toda chave JSON de string deve começar com um Emoji relevante (ex: "🚀 Nome").
2. LINGUAGEM HARDCORE: Seja brutal, científico, motivador. O nome do plano e descrição devem refletir guerra e vitória.
3. PRECISÃO BIOMECÂNICA: Se não houver fases excêntrica/concêntrica explícitas, CRIE essas descrições com maestria absoluta para cada exercício.
4. PERFEIÇÃO TÉCNICA: Em 'executionDetails', guie o usuário detalhando a postura correta e a cadência ótima.
5. TEMPO E DESCANSO: No campo 'rest', use apenas inteiros que representam segundos (ex: 60, 90).
6. RETORNE JSON EXATAMENTE SEGUNDO O SCHEMA.`;

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: workoutPlanSchema,
    },
  });

  const jsonStr = response.text || "{}";
  try {
    const parsed = JSON.parse(jsonStr) as WorkoutPlan;
    parsed.id = crypto.randomUUID();
    parsed.createdAt = Date.now();
    parsed.days = parsed.days.map(day => ({
      ...day,
      id: crypto.randomUUID(),
      exercises: day.exercises.map(ex => ({
        ...ex,
        id: crypto.randomUUID()
      }))
    }));
    return parsed;
  } catch (error) {
    captureError(error, 'geminiService.extractWorkoutFromFile.parse');
    throw new Error("Não foi possível entender o arquivo enviado. Verifique se ele contém um treino legível.");
  }
}

export async function suggestExerciseVariations(exerciseName: string, userProfile?: UserProfile): Promise<Array<{ name: string, description: string, difficulty: 'Easier' | 'Harder' | 'Different Focus' }>> {
  const prompt = `ATENÇÃO: Você é a I.A. Mestre da Forja Neural.
O usuário concluiu o exercício "${exerciseName}".
Forneça 3 sugestões de variações ou progressões para este exercício:
1. Uma versão MAIS FÁCIL (ou regressão).
2. Uma versão MAIS DIFÍCIL (ou progressão).
3. Uma variação com FOCO DIFERENTE (outro equipamento ou pegada).

Retorne um JSON contendo uma array de objetos com "name", "description" e "difficulty" (deve ser estritamente "Easier", "Harder", ou "Different Focus"). Toda string deve começar com um emoji.
Seja breve e hardcore nas descrições.

${userProfile ? `Perfil do usuário (para adaptar as sugestões):
- Experiência: ${userProfile.experienceLevel}
- Restrições/Lesões: ${userProfile.injuries || 'Nenhuma'}` : ''}`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        difficulty: { type: Type.STRING }
      },
      required: ["name", "description", "difficulty"]
    }
  };

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const jsonStr = response.text || "[]";
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    captureError(error, 'geminiService.suggestExerciseVariations.parse');
    return [];
  }
}

export async function adjustWorkoutForRecovery(plan: WorkoutPlan, recoveryLabel: string): Promise<string> {
  const prompt = `
Avalie este treino e sugira ajustes para hoje.
Recuperação do aluno: ${recoveryLabel}
Plano: ${JSON.stringify(plan)}

Se a recuperação estiver baixa, reduza volume/intensidade.
Se estiver média, faça ajustes moderados.
Se estiver alta, mantenha ou avance com prudência.
Responda em tópicos curtos, em português do Brasil.
`;

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
  });

  return response.text || "Sem ajuste necessário.";
}

export async function generateWeeklyReport(
  plans: WorkoutPlan[],
  workoutHistory: WorkoutHistoryRecord[] = []
): Promise<string> {
  const recentRecords = workoutHistory.slice(-7).map(record => ({
    day: record.dayName,
    focus: record.focus,
    date: new Date(record.date).toLocaleDateString('pt-BR'),
    volumeLoad: record.volumeLoad,
    durationMinutes: record.durationMinutes,
    completed: record.exercises.filter(ex => ex.completed).length,
    total: record.exercises.length,
    hard: record.exercises.filter(ex => ex.feedback === 'hard').length,
    painful: record.exercises.filter(ex => ex.feedback === 'painful').length,
    avgRpe:
      record.exercises.reduce((sum, ex) => sum + (ex.rpe || 0), 0) /
      Math.max(1, record.exercises.filter(ex => ex.rpe).length),
  }));

  const planSummary = plans.slice(0, 3).map(plan => ({
    name: plan.planName,
    goal: plan.goalDescription,
    days: plan.days.map(day => ({
      day: day.dayName,
      focus: day.focus,
      completed: day.exercises.filter(ex => ex.completed).length,
      total: day.exercises.length,
      hard: day.exercises.filter(ex => ex.feedback === 'hard').length,
      painful: day.exercises.filter(ex => ex.feedback === 'painful').length,
    })),
  }));

  const prompt = `
Gere um relatório semanal premium em português com:
1. resumo da aderência,
2. grupos fortes,
3. pontos de atenção,
4. recomendação da próxima semana.

Dados das sessões:
${JSON.stringify(recentRecords, null, 2)}

Dados dos planos:
${JSON.stringify(planSummary, null, 2)}
`;

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
  });

  return response.text || "Não foi possível gerar o relatório.";
}

export async function suggestExerciseAlternatives(
  exerciseName: string,
  injuries: string,
  equipment: string
): Promise<string[]> {
  const prompt = `
Sugira 5 exercícios substitutos para "${exerciseName}".
Considere:
- lesões/limitações: ${injuries || 'nenhuma'}
- equipamentos disponíveis: ${equipment || 'academia padrão'}

Responda apenas com JSON array de strings.
`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: { type: Type.STRING },
  };

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch {
    return [];
  }
}

export async function generateQuickWorkout(
  type: string,
  goal?: string,
  equipment?: string
): Promise<WorkoutPlan> {
  const constraints: Record<string, string> = {
    express: "Treino completo em 15-20 minutos. Máximo 5 exercícios, descanso curto e foco em eficiência.",
    bodyweight: "Apenas exercícios com peso corporal. Sem equipamentos.",
    equipment: `Apenas exercícios que possam ser feitos com: ${equipment || 'equipamentos básicos'}.`,
    goal: `Foco total no objetivo: ${goal || 'geral'}.`,
  };

  const prompt = `
Crie um treino rápido e eficiente em português do Brasil.
Restrição principal: ${constraints[type] || 'Treino geral equilibrado.'}

Inclua aquecimento, cooldown, duração estimada, grupos musculares, padrões de movimento e tags por exercício.
Responda estritamente em JSON no schema de WorkoutPlan.
`;

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: workoutPlanSchema,
    },
  });

  const parsed = JSON.parse(response.text || '{}') as WorkoutPlan;
  parsed.id = crypto.randomUUID();
  parsed.createdAt = Date.now();
  parsed.days = (parsed.days || []).map(day => ({
    ...day,
    id: crypto.randomUUID(),
    exercises: (day.exercises || []).map(ex => ({
      ...ex,
      id: crypto.randomUUID(),
    })),
  }));

  return parsed;
}
