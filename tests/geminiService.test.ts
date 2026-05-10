import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateWorkoutPlan } from '../src/services/geminiService';

describe('geminiService', () => {
  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T12:00:00Z'));
  });

  it('gera treino local quando Gemini não está configurado', async () => {
    const plan = await generateWorkoutPlan({
      age: 25,
      gender: 'Masculino',
      weight: 70,
      height: 175,
      experienceLevel: 'Iniciante',
      goal: 'Hipertrofia (Ganho de Massa)',
      daysPerWeek: 3,
      sessionDuration: '60 minutos',
      injuries: '',
      equipment: 'Academia completa',
      gymType: 'Academia',
      timePerWorkout: 60,
      workoutLocation: 'Academia',
    });

    expect(plan.planName).toContain('Hipertrofia');
    expect(plan.days).toHaveLength(3);
    expect(plan.days[0].exercises.length).toBeGreaterThan(0);
    expect(plan.days[0].exercises[0]).toMatchObject({
      name: 'Supino Reto com Barra',
      sets: 3,
      reps: '8-12',
    });
  });
});
