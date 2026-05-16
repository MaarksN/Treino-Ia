import { describe, expect, it } from 'vitest';
import { buildMonthlyTrainingReport } from './monthlyTrainingReport';

describe('monthly training report', () => {
  it('aggregates summary fields', () => {
    const report = buildMonthlyTrainingReport('2026-05', [
      { id: '1', completedAt: 1, planId: 'p', dayId: 'd', dayName: 'Seg', focus: 'A', durationMinutes: 50, totalVolume: 1000, totalExercises: 5, completedExercises: 5, exercises: [], feedback: '', nextRecommendation: '' },
      { id: '2', completedAt: 2, planId: 'p', dayId: 'd', dayName: 'Ter', focus: 'B', durationMinutes: 40, totalVolume: 800, totalExercises: 5, completedExercises: 4, exercises: [], feedback: '', nextRecommendation: '' },
    ]);
    expect(report.sessions).toBe(2);
    expect(report.totalVolume).toBe(1800);
  });
});
