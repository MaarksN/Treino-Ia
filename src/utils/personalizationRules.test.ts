import { describe, expect, it } from 'vitest';
import {
  buildDayVariationGuardrails,
  computeDeterministicFlags,
  enforceTrainingGuardrails,
  listDeterministicFlagLabels,
  validateAvailableMinutes,
} from './personalizationRules';

describe('personalizationRules', () => {
  it('normaliza tempo disponível', () => {
    expect(validateAvailableMinutes(9)).toBe(15);
    expect(validateAvailableMinutes(240)).toBe(180);
  });

  it('detecta risco e deload por fadiga', () => {
    const flags = computeDeterministicFlags(
      { daysPerWeek: 5, goal: 'Hipertrofia', age: 30, gender: 'Masculino', height: 180, weight: 80, experienceLevel: 'Intermediário', injuries: '', equipment: '' },
      [],
      { timestamp: Date.now(), sleepHours: 5, sorenessLevel: 3, stressLevel: 4, energyLevel: 4 }
    );
    expect(flags.deloadNeeded).toBe(true);
    expect(flags.recommendedFrequency).toBeLessThanOrEqual(4);
  });

  it('bloqueia tempo disponível inválido', () => {
    expect(() => validateAvailableMinutes(0)).toThrow('Tempo disponível inválido.');
    expect(() => validateAvailableMinutes(Number.NaN)).toThrow('Tempo disponível inválido.');
  });

  it('reduz volume e intensidade por baixa recuperação', () => {
    const flags = computeDeterministicFlags(
      { daysPerWeek: 4, goal: 'Hipertrofia', age: 30, gender: 'Masculino', height: 180, weight: 80, experienceLevel: 'Intermediário', injuries: '', equipment: '' },
      [],
      { timestamp: Date.now(), sleepHours: 5, sorenessLevel: 2, stressLevel: 3, energyLevel: 3 }
    );

    const guarded = enforceTrainingGuardrails({
      volumeAdjustment: 'maintain' as const,
      intensityAdjustment: 'maintain' as const,
      safetyNotes: [],
      summary: 'base',
    }, flags);

    expect(guarded.volumeAdjustment).toBe('reduce');
    expect(guarded.intensityAdjustment).toBe('reduce');
  });

  it('detecta dor ou limitação e gera flag de substituição segura', () => {
    const flags = computeDeterministicFlags(
      { daysPerWeek: 4, goal: 'Hipertrofia', age: 30, gender: 'Masculino', height: 180, weight: 80, experienceLevel: 'Intermediário', injuries: 'dor no ombro', equipment: '' },
      [],
      undefined
    );

    expect(flags.painOrLimitation).toBe(true);
    expect(listDeterministicFlagLabels(flags)).toContain('pain_or_limitation_safe_swap');
  });

  it('ativa flag determinística de plateau com histórico estagnado', () => {
    const sessions = Array.from({ length: 6 }, (_, index) => ({
      id: `s-${index}`,
      planId: 'p1',
      dayId: 'd1',
      completedAt: Date.now() - index * 86400000,
      logs: [{ exerciseName: 'Supino', date: Date.now(), actualWeight: 50, actualReps: '8', rpe: 8 }],
    }));

    const flags = computeDeterministicFlags(
      { daysPerWeek: 4, goal: 'Hipertrofia', age: 30, gender: 'Masculino', height: 180, weight: 80, experienceLevel: 'Intermediário', injuries: '', equipment: '' },
      sessions,
      undefined
    );

    expect(flags.plateauRisk).toBe('alto');
    expect(listDeterministicFlagLabels(flags)).toContain('plateau_detected');
  });

  it('variação do dia respeita tempo, recuperação e equipamento', () => {
    const guardrails = buildDayVariationGuardrails({
      availableMinutes: 25,
      equipment: 'halteres, banco',
      recovery: { timestamp: Date.now(), sleepHours: 5, sorenessLevel: 5, stressLevel: 7, energyLevel: 3 },
    });

    expect(guardrails.availableMinutes).toBe(25);
    expect(guardrails.equipment).toContain('halteres');
    expect(guardrails.volumeAdjustment).toBe('reduce');
    expect(guardrails.intensityAdjustment).toBe('reduce');
  });
});
