import { describe, expect, it } from 'vitest';
import { adaptWorkoutSession, adaptWorkoutSessionList } from './jsonbWorkoutAdapter';

describe('jsonbWorkoutAdapter', () => {
  it('adapts a valid workout session row', () => {
    const session = adaptWorkoutSession({
      record_json: {
        id: 's1',
        planId: 'p1',
        dayId: 'd1',
        dayName: 'Dia 1',
        focus: 'Full body',
        completedAt: 1000,
        durationMinutes: 45,
        totalVolume: 1200,
        completedExercises: 3,
        totalExercises: 4,
        feedback: 'Bom',
        nextRecommendation: 'Subir carga',
        exercises: [
          { exerciseId: 'e1', name: 'Agachamento', targetSets: 3, targetReps: '10', targetRest: '90s', completed: true },
        ],
      },
    });

    expect(session).not.toBeNull();
    expect(session!.id).toBe('s1');
    expect(session!.exercises).toHaveLength(1);
    expect(session!.exercises[0].name).toBe('Agachamento');
  });

  it('returns null for null/undefined row', () => {
    expect(adaptWorkoutSession(null)).toBeNull();
    expect(adaptWorkoutSession(undefined)).toBeNull();
  });

  it('returns null when record_json is not an object', () => {
    expect(adaptWorkoutSession({ record_json: 'garbage' })).toBeNull();
    expect(adaptWorkoutSession({ record_json: 42 })).toBeNull();
  });

  it('returns null when id is missing', () => {
    expect(adaptWorkoutSession({ record_json: { planId: 'p1' } })).toBeNull();
  });

  it('uses fallback values for missing fields', () => {
    const session = adaptWorkoutSession({
      record_json: { id: 's2' },
      volume_load: 500,
    });

    expect(session).not.toBeNull();
    expect(session!.dayName).toBe('Dia');
    expect(session!.totalVolume).toBe(500);
    expect(session!.exercises).toEqual([]);
  });

  it('filters invalid exercises from array', () => {
    const session = adaptWorkoutSession({
      record_json: {
        id: 's3',
        exercises: [
          { exerciseId: 'e1', name: 'Supino', targetSets: 3, targetReps: '10', targetRest: '60s', completed: false },
          'not-an-exercise',
          null,
          42,
        ],
      },
    });

    expect(session!.exercises).toHaveLength(1);
  });

  it('adapts a list of rows filtering invalid ones', () => {
    const result = adaptWorkoutSessionList([
      { record_json: { id: 's1', exercises: [] } },
      { record_json: null },
      { record_json: { id: 's2', exercises: [] } },
    ]);

    expect(result).toHaveLength(2);
  });
});
