import { describe, expect, it } from 'vitest';
import {
  buildMonthlyTrainingReport,
  buildTrainingPeriodReport,
  filterWorkoutSessionsByPeriod,
} from './monthlyTrainingReport';
import { type WorkoutSession } from '../database';

const sessions: WorkoutSession[] = [
  { id: '1', completedAt: new Date('2026-05-10T12:00:00Z').getTime(), planId: 'p', dayId: 'd', dayName: 'Seg', focus: 'A', durationMinutes: 50, totalVolume: 1000, totalExercises: 5, completedExercises: 5, exercises: [], feedback: '', nextRecommendation: '' },
  { id: '2', completedAt: new Date('2026-05-11T12:00:00Z').getTime(), planId: 'p', dayId: 'd', dayName: 'Ter', focus: 'B', durationMinutes: 40, totalVolume: 800, totalExercises: 5, completedExercises: 4, exercises: [], feedback: '', nextRecommendation: '' },
  { id: '3', completedAt: new Date('2026-04-11T12:00:00Z').getTime(), planId: 'p', dayId: 'd', dayName: 'Qua', focus: 'A', durationMinutes: 30, totalVolume: 500, totalExercises: 4, completedExercises: 2, exercises: [], feedback: '', nextRecommendation: '' },
];

describe('monthly training report', () => {
  it('aggregates summary fields', () => {
    const report = buildMonthlyTrainingReport('2026-05', sessions.slice(0, 2));
    expect(report.sessions).toBe(2);
    expect(report.totalVolume).toBe(1800);
  });

  it('filters sessions by month and year', () => {
    const reference = new Date('2026-05-20T12:00:00Z');

    expect(filterWorkoutSessionsByPeriod(sessions, 'month', reference).map(session => session.id)).toEqual(['1', '2']);
    expect(filterWorkoutSessionsByPeriod(sessions, 'year', reference).map(session => session.id)).toEqual(['1', '2', '3']);
  });

  it('builds monthly and annual product reports', () => {
    const monthly = buildTrainingPeriodReport('month', sessions, new Date('2026-05-20T12:00:00Z'));
    const yearly = buildTrainingPeriodReport('year', sessions, new Date('2026-05-20T12:00:00Z'));

    expect(monthly.sessions).toBe(2);
    expect(monthly.completionRate).toBe(90);
    expect(yearly.sessions).toBe(3);
    expect(yearly.topFocus).toBe('A');
  });
});
