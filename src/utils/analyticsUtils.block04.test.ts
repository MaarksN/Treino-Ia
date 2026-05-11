import { describe, expect, it } from 'vitest';
import { Exercise, WorkoutHistoryEntry, WorkoutHistoryRecord } from '../types';
import { getGoalProgressIndicators, getWeekOverWeekComparison, getWeeklyAverageRpe, getWeeklyMuscleGroupVolume } from './analyticsUtils';

function isoDate(daysAgo: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function timestamp(daysAgo: number) {
  const date = new Date(`${isoDate(daysAgo)}T12:00:00Z`);
  return date.getTime();
}

function exercise(name: string, muscleGroup: string, rpe: number): Exercise {
  return {
    id: name,
    name,
    muscleGroup,
    sets: 3,
    reps: '10',
    rest: '90s',
    actualWeight: 50,
    actualReps: '10',
    rpe,
  };
}

const records: WorkoutHistoryRecord[] = [
  {
    id: 'current',
    date: timestamp(0),
    planId: 'p1',
    dayId: 'd1',
    dayName: 'Dia 1',
    focus: 'Peito',
    volumeLoad: 1500,
    durationMinutes: 45,
    exercises: [exercise('Supino', 'Peito', 8)],
  },
  {
    id: 'previous',
    date: timestamp(7),
    planId: 'p1',
    dayId: 'd2',
    dayName: 'Dia 2',
    focus: 'Costas',
    volumeLoad: 1200,
    durationMinutes: 42,
    exercises: [exercise('Remada', 'Costas', 7)],
  },
];

const history: WorkoutHistoryEntry[] = [
  {
    id: 'h-current',
    planId: 'p1',
    planName: 'Plano',
    date: isoDate(0),
    dayFocus: 'Peito',
    exerciseCount: 1,
    completedCount: 1,
    totalVolume: 1500,
  },
  {
    id: 'h-previous',
    planId: 'p1',
    planName: 'Plano',
    date: isoDate(7),
    dayFocus: 'Costas',
    exerciseCount: 1,
    completedCount: 1,
    totalVolume: 1200,
  },
];

describe('analyticsUtils Bloco 04', () => {
  it('computes weekly muscle group volume from workout records', () => {
    const weekly = getWeeklyMuscleGroupVolume(records, 2);
    expect(weekly.some(week => week.groups.Peito === 1500)).toBe(true);
    expect(weekly.some(week => week.groups.Costas === 1500)).toBe(true);
  });

  it('computes weekly average RPE', () => {
    const trend = getWeeklyAverageRpe(records, 2);
    expect(trend.some(week => week.avgRpe === 8)).toBe(true);
  });

  it('compares current week against previous week', () => {
    const comparison = getWeekOverWeekComparison(history, records, 3);
    expect(comparison.volumeDelta).toBe(300);
    expect(comparison.sessionsDelta).toBe(0);
  });

  it('builds goal-aware progress indicators', () => {
    const indicators = getGoalProgressIndicators({
      age: 30,
      gender: 'Masculino',
      weight: 80,
      height: 180,
      experienceLevel: 'Intermediário',
      goal: 'Hipertrofia',
      daysPerWeek: 3,
      injuries: '',
    }, history, records);

    expect(indicators[0].label).toContain('hipertrofia');
  });
});
