import { describe, expect, it } from 'vitest';
import { createDefaultProfile } from '../../../services/database';
import { parseDraftSetMetrics, validateDashboardProfileInput } from './dashboardValidation';

describe('dashboardValidation', () => {
  it('normaliza campos numericos e textos da anamnese', () => {
    const result = validateDashboardProfileInput({
      ...createDefaultProfile(),
      name: '  ',
      goal: '',
      injuries: '',
      equipment: '',
      daysPerWeek: 12,
      timePerWorkout: 10,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.name).toBe('Atleta');
    expect(result.data.goal).toBe('Hipertrofia');
    expect(result.data.daysPerWeek).toBe(6);
    expect(result.data.timePerWorkout).toBe(20);
  });

  it('retorna erro granular para nivel invalido', () => {
    const result = validateDashboardProfileInput({
      ...createDefaultProfile(),
      level: 'elite' as never,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.issues[0]).toContain('level');
  });

  it('parseia metricas de serie com virgula decimal e limites seguros', () => {
    expect(parseDraftSetMetrics({ weight: '82,5', reps: '8.6', rpe: '12' })).toEqual({
      weight: 82.5,
      reps: 9,
      rpe: 10,
    });
  });
});
