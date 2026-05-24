import { describe, it, expect } from 'vitest';
import { mapWorkoutHistoryToWorkoutSessions } from './workoutHistoryAdapter';
import type { WorkoutHistoryRecord } from '../types/training';

describe('workoutHistoryAdapter', () => {
  it('handles empty or invalid inputs gracefully', () => {
    expect(mapWorkoutHistoryToWorkoutSessions([])).toEqual([]);
    expect(mapWorkoutHistoryToWorkoutSessions(null as any)).toEqual([]);
    expect(mapWorkoutHistoryToWorkoutSessions([null, undefined, 123, 'test'])).toEqual([]);
  });

  it('converts a valid store history record to WorkoutSession correctly', () => {
    const input: WorkoutHistoryRecord[] = [
      {
        id: 'session-1',
        date: 1700000000000,
        planId: 'plan-1',
        dayId: 'day-1',
        dayName: 'Day 1',
        focus: 'Chest',
        volumeLoad: 1000,
        durationMinutes: 45,
        exercises: [
          {
            id: 'ex-1',
            name: 'Supino Reto',
            sets: 3,
            reps: '10',
            rest: '60s',
            actualWeight: 80,
            rpe: 8,
            setLogs: [
              { setNumber: 1, weight: 80, reps: 10, rpe: 7 },
              { setNumber: 2, weight: 80, reps: 9, rpe: 8 },
              { setNumber: 3, weight: 80, reps: 8, rpe: 9 },
            ]
          }
        ]
      }
    ];

    const result = mapWorkoutHistoryToWorkoutSessions(input);
    expect(result).toHaveLength(1);
    const session = result[0];
    
    expect(session.id).toBe('session-1');
    expect(session.completedAt).toBe(1700000000000);
    expect(session.exercises).toHaveLength(1);

    const exercise = session.exercises[0];
    expect(exercise.exerciseId).toBe('ex-1');
    expect(exercise.name).toBe('Supino Reto');
    expect(exercise.targetSets).toBe(3);
    expect(exercise.actualWeight).toBe(80);
    expect(exercise.rpe).toBe(8);

    expect(exercise.sets).toHaveLength(3);
    expect(exercise.sets![0]).toEqual({ weight: 80, reps: 10, rpe: 7 });
  });

  it('ignores invalid exercises without crashing', () => {
    const input = [
      {
        id: 'session-invalid-ex',
        exercises: [
          null,
          undefined,
          123,
          { id: 'ex-2', name: 'Valid Ex' }
        ]
      }
    ];

    const result = mapWorkoutHistoryToWorkoutSessions(input);
    expect(result).toHaveLength(1);
    expect(result[0].exercises).toHaveLength(1);
    expect(result[0].exercises[0].exerciseId).toBe('ex-2');
  });

  it('preserves exerciseId and exerciseName from different formats', () => {
    const input = [
      {
        id: 's1',
        exercises: [
          { exerciseId: 'ex-3', exerciseName: 'Leg Press' },
          { id: 'ex-4', name: 'Hack Squat' }
        ]
      }
    ];

    const result = mapWorkoutHistoryToWorkoutSessions(input);
    expect(result[0].exercises[0].exerciseId).toBe('ex-3');
    expect(result[0].exercises[0].name).toBe('Leg Press');
    
    expect(result[0].exercises[1].exerciseId).toBe('ex-4');
    expect(result[0].exercises[1].name).toBe('Hack Squat');
  });

  it('works with missing optional fields', () => {
    const input = [
      {
        id: 's2',
        exercises: [
          { id: 'ex-5' } // No name, no sets, no weight
        ]
      }
    ];

    const result = mapWorkoutHistoryToWorkoutSessions(input);
    const ex = result[0].exercises[0];
    expect(ex.name).toBe('Exercício Desconhecido');
    expect(ex.actualWeight).toBe(0);
    expect(ex.targetSets).toBe(0);
    expect(ex.sets).toEqual([]);
  });

  it('normalizes legacy payload format correctly (sets as array)', () => {
    const input = [
      {
        id: 's3',
        exercises: [
          {
            id: 'ex-6',
            sets: [
              { weight: 50, reps: 12, rpe: 6 }
            ]
          }
        ]
      }
    ];

    const result = mapWorkoutHistoryToWorkoutSessions(input);
    const ex = result[0].exercises[0];
    expect(ex.targetSets).toBe(0); // targetSets expected to be a number, array becomes 0 via Number()
    expect(ex.sets).toHaveLength(1);
    expect(ex.sets![0]).toEqual({ weight: 50, reps: 12, rpe: 6 });
  });

  it('falls back to actualWeight/rpe if set values are missing in setLogs', () => {
    const input = [
      {
        id: 's4',
        exercises: [
          {
            id: 'ex-7',
            actualWeight: 100,
            rpe: 8,
            setLogs: [
              { setNumber: 1 } // Missing weight and rpe in log
            ]
          }
        ]
      }
    ];

    const result = mapWorkoutHistoryToWorkoutSessions(input);
    const ex = result[0].exercises[0];
    expect(ex.sets).toHaveLength(1);
    expect(ex.sets![0]).toEqual({ weight: 100, reps: 0, rpe: 8 });
  });
});
