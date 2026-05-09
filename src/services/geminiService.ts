import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, WorkoutPlan } from "../types";

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

  const prompt = `ATENÇÃO: Você é a Inteligência Artificial Supremo de Treinamento, responsável por forjar atletas de elite e mudar vidas.
O usuário enviou este perfil e precisa do melhor plano de treinamento do MUNDO:
- Idade: ${profile.age} anos
- Sexo: ${profile.gender}
- Peso: ${profile.weight} kg
- Altura: ${profile.height} cm
- Experiência: ${profile.experienceLevel}
- Objetivo: ${profile.goal}
- Dias de Treino/Semana: ${profile.daysPerWeek}
- Duração das Sessões: ${profile.timePerWorkout} minutos
- Ambiente de Treino: ${profile.workoutLocation}
- Foco Secundário: ${profile.secondaryFocus || "Nenhum"}
- Lesões ou Restrições: ${profile.injuries || "Nenhuma"}
-${feedbackContext}

REGRAS OBRIGATÓRIAS (FALHAR NÃO É UMA OPÇÃO):
1. EMOJIS: Toda chave JSON de string deve começar com um Emoji relevante (ex: "🚀 Nome").
2. LINGUAGEM HARDCORE: Seja brutal, científico, motivador. Fale como um mestre da hipertrofia cibernético.
3. PRECISÃO BIOMECÂNICA: 'concentricPhase' deve explicar extamente a contração máxima gerada, músculos alvo, etc. 'eccentricPhase' deve explicar como frear a carga e induzir as microlesões.
4. ADAPTAÇÃO TOTAL: Se for 'Casa (Peso Corporal)', não coloque supino com barra. Se for 20 minutos, faça um HIIT/treino metabólico intenso. Respeite as variáveis do usuário de forma divina.
5. EXECUÇÃO DIVINA: 'executionDetails' deve soar como um treinador espartano ensinando a postura perfeita.
6. JSON VALIDO: Você deve retornar o plano estritamente validado com o schema exigido.`;

  const response = await ai.models.generateContent({
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

export async function analyzeBodyImage(base64Image: string, mimeType: string, profile: UserProfile): Promise<string> {
  const prompt = `ATENÇÃO: Você é um Treinador Cibernético focado em hipertrofia e composição corporal.
O usuário enviou uma foto de progressão. Analise a imagem em relação ao biotipo atual (Peso: ${profile.weight}kg, Nível: ${profile.experienceLevel}).
1. Forneça uma avaliação brutalmente honesta da composição corporal projetada.
2. Identifique pontos fortes (músculos que parecem mais desenvolvidos).
3. Identifique assimetrias ou grupos musculares que precisam de foco.
4. Mantenha o formato Markdown, usando emojis e tom hardcore.
IMPORTANTE: Não dê conselhos médicos, fale estritamente como um bodybuilder avaliando um atleta.`;

  const response = await ai.models.generateContent({
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

  const response = await ai.models.generateContent({
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

export async function generateWeeklyReport(workoutHistory: WorkoutHistoryRecord[]): Promise<string> {
  const prompt = `ATENÇÃO: Você é a I.A. Treinadora Supremo.
Aqui estão os registros de treino das últimas sessões do usuário. Analise os dados e gere um relatório brutal de avaliação de final de microciclo:
1. Resumo do volume.
2. Identifique sinais de PLATÔ (pouca variação de carga).
3. Identifique sinais de OVERTRAINING (exaustão marcante ou queda de reps).
4. Recomende se devemos iniciar o próximo microciclo com SOBRECARGA PROGRESSIVA pesada ou deload.

Use emojis, formato Markdown (com listas e bolds) e seja super motivacional porém técnico. Seja breve (máx 3 parágrafos).

Dados do histórico recente (apenas para contexto, não imprima o JSON na resposta):
${JSON.stringify(workoutHistory.map(r => ({ date: new Date(r.date).toISOString(), focus: r.focus, load: r.volumeLoad })).slice(0, 10))}`;

  const response = await ai.models.generateContent({
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

  const response = await ai.models.generateContent({
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

  const response = await ai.models.generateContent({
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
