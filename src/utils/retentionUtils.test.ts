import { describe, expect, it } from 'vitest';
import {
  buildQuickWorkoutPlan,
  calculateBestDailyStreak,
  calculateDailyStreak,
  calculateWeeklyStreak,
  getWeekStartIso,
  validateReminderSchedule,
} from './retentionUtils';

describe('retentionUtils', () => {
  it('calculates daily streaks anchored on today', () => {
    expect(calculateDailyStreak(['2026-05-08', '2026-05-09', '2026-05-10'], '2026-05-10')).toBe(3);
    expect(calculateDailyStreak(['2026-05-08', '2026-05-10'], '2026-05-10')).toBe(1);
    expect(calculateBestDailyStreak(['2026-05-01', '2026-05-02', '2026-05-04'])).toBe(2);
  });

  it('uses Monday as the weekly streak boundary', () => {
    expect(getWeekStartIso('2026-05-10')).toBe('2026-05-04');
    expect(calculateWeeklyStreak(['2026-04-27', '2026-05-04', '2026-05-10'], '2026-05-10')).toBe(2);
  });

  it('validates reminder schedules', () => {
    expect(() => validateReminderSchedule('workout', { time: '07:30' })).not.toThrow();
    expect(() => validateReminderSchedule('workout', { time: '7:30' })).toThrow(/Horário/);
    expect(() => validateReminderSchedule('hydration', { everyMinutes: 10 })).toThrow(/hidratação/);
    expect(() => validateReminderSchedule('reactivation', { inactivityDays: 1 })).toThrow(/Reativação/);
  });

  it('builds deterministic quick workouts without mock data', () => {
    const plan = buildQuickWorkoutPlan({
      durationMinutes: 20,
      goal: 'hipertrofia',
      location: 'casa sem equipamento',
      reason: 'agenda_corrida',
    });

    expect(plan.title).toBe('Treino alternativo 20min');
    expect(plan.exercises).toContain('Agachamento livre');
    expect(plan.reason).toBe('agenda_corrida');
  });
});
