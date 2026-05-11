import { describe, expect, it } from 'vitest';
import { Exercise, WorkoutDay, WorkoutPlan } from '../types';
import { buildWorkoutRecord, calculateDayVolume, extractPersonalRecords, sanitizeSetLog } from './workoutExecutionService';

const exercise: Exercise = {
  id: 'supino',
  name: 'Supino Reto',
  sets: 2,
  reps: '8-10',
  rest: '90s',
  setLogs: [
    { setNumber: 1, weight: 80, reps: 8, rpe: 8, completedAt: 1 },
    { setNumber: 2, weight: 82.5, reps: 6, rpe: 9, failed: true, completedAt: 2 },
  ],
};

const day: WorkoutDay = {
  id: 'day-a',
  dayName: 'Dia A',
  focus: 'Peito',
  exercises: [exercise],
};

const plan: WorkoutPlan = {
  id: 'plan-1',
  createdAt: 1,
  planName: 'Plano Teste',
  goalDescription: 'Força',
  days: [day],
};

describe('workoutExecutionService', () => {
  it('sanitizes invalid set input without throwing', () => {
    expect(sanitizeSetLog({ setNumber: 0, weight: -10, reps: -1, rpe: 12, note: 'x'.repeat(300) })).toMatchObject({
      setNumber: 1,
      failed: false,
      technicalFailure: false,
    });
  });

  it('calculates volume from completed set logs', () => {
    expect(calculateDayVolume(day)).toBe(1135);
  });

  it('builds a workout record with real exercise data', () => {
    const record = buildWorkoutRecord(plan, day, 42);
    expect(record.planId).toBe('plan-1');
    expect(record.volumeLoad).toBe(1135);
    expect(record.durationMinutes).toBe(42);
    expect(record.exercises[0].setLogs).toHaveLength(2);
  });

  it('extracts personal records from best set performance', () => {
    expect(extractPersonalRecords(plan, day)).toEqual([
      expect.objectContaining({
        exerciseName: 'Supino Reto',
        weight: 82.5,
        reps: 6,
      }),
    ]);
  });

  it('deduplicates personal records by keeping the best performance per exercise', () => {
    const duplicateDay: WorkoutDay = {
      ...day,
      exercises: [
        exercise,
        {
          ...exercise,
          id: 'supino-backoff',
          setLogs: [{ setNumber: 1, weight: 70, reps: 12, completedAt: 3 }],
        },
      ],
    };

    expect(extractPersonalRecords(plan, duplicateDay)).toEqual([
      expect.objectContaining({
        exerciseName: 'Supino Reto',
        weight: 82.5,
        reps: 6,
      }),
    ]);
  });
});
