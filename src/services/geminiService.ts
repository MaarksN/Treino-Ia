import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, WorkoutHistoryRecord, WorkoutPlan } from "../types";

let aiClient: GoogleGenAI | null = null;

function getAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return aiClient;
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
        required: ["dayName", "focus", "exercises"],
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
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Erro ao gerar o plano de treino. Tente novamente.");
  }
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
    console.error("Failed to parse Gemini response:", error);
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
    console.error("Failed to parse variations:", error);
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
