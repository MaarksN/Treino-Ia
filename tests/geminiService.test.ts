import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateWorkoutPlan } from '../src/services/geminiService';
import { supabase } from '../src/services/supabaseClient';

vi.mock('../src/services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe('geminiService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: 'supabase-token',
        },
      },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
  });

  it('gera treino chamando o proxy Gemini autenticado', async () => {
    const aiPlan = {
      planName: 'Plano real via IA',
      goalDescription: 'Gerado pelo proxy autenticado.',
      days: [
        {
          dayName: 'Dia 1',
          focus: 'Full Body',
          warmup: 'Aquecimento real',
          cooldown: 'Cooldown real',
          estimatedDuration: '60 minutos',
          exercises: [
            {
              name: 'Supino Reto',
              sets: 3,
              reps: '8-12',
              rest: '90s',
              executionDetails: 'Controle a barra.',
              concentricPhase: 'Empurre com controle.',
              eccentricPhase: 'Desça lentamente.',
            },
          ],
        },
      ],
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(aiPlan) }],
            },
          },
        ],
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const plan = await generateWorkoutPlan({
      age: 25,
      gender: 'Masculino',
      weight: 70,
      height: 175,
      experienceLevel: 'Iniciante',
      goal: 'Hipertrofia',
      daysPerWeek: 3,
      sessionDuration: '60 minutos',
      injuries: '',
      equipment: 'Academia completa',
      gymType: 'Academia',
      timePerWorkout: 60,
      workoutLocation: 'Academia',
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/gemini-proxy', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        authorization: 'Bearer supabase-token',
      }),
    }));
    expect(plan.planName).toBe(aiPlan.planName);
    expect(plan.days[0].exercises[0].name).toBe('Supino Reto');
  });
});
