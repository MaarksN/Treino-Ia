import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserProfile, WorkoutPlan, WorkoutSession } from '../types';
import {
  adjustBySleepAndStress,
  adjustWorkoutForAvailableTime,
  detectRiskOfAbandonment,
  generateAdvancedWorkoutPlan,
  generateDayVariations,
  generateDeloadAdvice,
  predictPlateau,
  recommendWeeklyVolume,
  suggestExerciseAlternatives,
} from './aiPersonalizationService';

const generateContent = vi.hoisted(() => vi.fn());

vi.mock('./geminiProxyClient', () => ({
  createGeminiProxyClient: () => ({
    models: { generateContent },
  }),
}));

const profile: UserProfile = {
  age: 32,
  gender: 'Masculino',
  weight: 82,
  height: 180,
  experienceLevel: 'Intermediário',
  goal: 'Hipertrofia',
  daysPerWeek: 4,
  injuries: '',
  equipment: 'halteres, barra',
};

const plan: WorkoutPlan = {
  id: 'p1',
  createdAt: Date.now(),
  planName: 'Plano teste',
  goalDescription: 'Hipertrofia',
  days: [
    {
      id: 'd1',
      dayName: 'A',
      focus: 'Peito',
      exercises: [{ id: 'e1', name: 'Supino', sets: 3, reps: '8-10', rest: '90s' }],
    },
  ],
};

function highFatigueSessions(): WorkoutSession[] {
  return [{
    id: 's1',
    planId: 'p1',
    dayId: 'd1',
    completedAt: Date.now(),
    readiness: { timestamp: Date.now(), sleepHours: 5, sorenessLevel: 5, stressLevel: 5, energyLevel: 3 },
    logs: [{ exerciseName: 'Supino', date: Date.now(), actualWeight: 80, actualReps: '8', rpe: 9 }],
  }];
}

function plateauSessions(): WorkoutSession[] {
  return Array.from({ length: 6 }, (_, index) => ({
    id: `s-${index}`,
    planId: 'p1',
    dayId: 'd1',
    completedAt: Date.now() - index * 86400000,
    logs: [{ exerciseName: 'Supino', date: Date.now(), actualWeight: 50, actualReps: '8', rpe: 8 }],
  }));
}

describe('aiPersonalizationService', () => {
  beforeEach(() => {
    generateContent.mockReset();
  });

  it('retorna JSON válido da IA com auditoria', async () => {
    generateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        split: 'Upper/lower',
        dayFocus: ['Upper', 'Lower'],
        weeklyVolume: 'Moderado',
        idealFrequency: 4,
        safetyNotes: ['Monitorar RPE.'],
        initialProgression: 'Progressão dupla.',
        summary: 'Plano validado.',
      }),
    });

    const result = await generateAdvancedWorkoutPlan(profile, []);

    expect(result.data.split).toBe('Upper/lower');
    expect(result.audit.usedAi).toBe(true);
    expect(result.audit.validationStatus).toBe('valid');
  });

  it('usa fallback seguro quando a IA retorna JSON inválido', async () => {
    generateContent.mockResolvedValueOnce({ text: '{"risk":}' });

    const result = await predictPlateau(plan, plateauSessions());

    expect(result.audit.usedDeterministicFallback).toBe(true);
    expect(result.audit.validationStatus).toBe('invalid_json');
    expect(result.data.plateauDetected).toBe(true);
  });

  it('usa fallback seguro quando a IA retorna texto livre', async () => {
    generateContent.mockResolvedValueOnce({ text: 'Faça 10 a 12 séries.' });

    const result = await recommendWeeklyVolume(profile);

    expect(result.audit.usedDeterministicFallback).toBe(true);
    expect(result.audit.validationStatus).toBe('no_json');
    expect(result.data.muscleGroups.length).toBeGreaterThan(0);
  });

  it('força deload por fadiga alta mesmo se IA sugerir manter', async () => {
    generateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        needed: false,
        signals: [],
        nextWeekAdjustment: 'Manter.',
        volumeReductionPercent: 0,
        intensityReductionPercent: 0,
        summary: 'Sem deload.',
      }),
    });

    const result = await generateDeloadAdvice(plan, highFatigueSessions());

    expect(result.data.needed).toBe(true);
    expect(result.data.volumeReductionPercent).toBeGreaterThanOrEqual(30);
    expect(result.audit.deterministicFlags).toContain('high_fatigue_force_deload');
  });

  it('gera substituição segura por dor/limitação', async () => {
    generateContent.mockResolvedValueOnce({ text: 'sem json' });

    const result = await suggestExerciseAlternatives('Supino', 'halteres', 'dor no ombro');

    expect(result.data.byPainOrLimitation.length).toBeGreaterThan(0);
    expect(result.audit.deterministicFlags).toContain('pain_or_limitation_safe_swap');
  });

  it('reduz agressividade por sono e estresse ruins', async () => {
    generateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        intensityAdjustment: 'maintain',
        volumeAdjustment: 'maintain',
        aggressiveness: 'normal',
        notes: ['Manter.'],
        summary: 'Base IA.',
      }),
    });

    const result = await adjustBySleepAndStress(plan, '5', '9');

    expect(result.data.intensityAdjustment).toBe('reduce');
    expect(result.data.volumeAdjustment).toBe('reduce');
    expect(result.data.aggressiveness).toBe('conservative');
  });

  it('variação do dia respeita tempo reduzido', async () => {
    generateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        availableMinutes: 90,
        equipment: ['máquinas'],
        volumeAdjustment: 'maintain',
        intensityAdjustment: 'maintain',
        variations: ['Treino longo.'],
        safetyNotes: [],
        summary: 'Base IA.',
      }),
    });

    const result = await generateDayVariations(plan, 'Tenho 25 min em casa.');

    expect(result.data.availableMinutes).toBe(25);
    expect(result.data.volumeAdjustment).toBe('reduce');
    expect(result.data.equipment).toContain('peso corporal');
  });

  it('risco alto de abandono gera alerta estruturado', async () => {
    generateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        risk: 'baixo',
        signals: [],
        recommendedAction: 'Manter.',
        alert: '',
        summary: 'Baixo.',
      }),
    });

    const result = await detectRiskOfAbandonment(profile, []);

    expect(result.data.risk).toBe('alto');
    expect(result.data.alert).toContain('risco alto');
  });

  it('tempo disponível inválido bloqueia prompt IA', async () => {
    await expect(adjustWorkoutForAvailableTime(plan, 0)).rejects.toThrow('Tempo disponível inválido.');
    expect(generateContent).not.toHaveBeenCalled();
  });
});
