import { describe, it, expect } from 'vitest';
import { Exercise } from './Exercise';

describe('Exercise Entity', () => {
  it('should create a valid Exercise', () => {
    const exercise = Exercise.create({
      name: 'Bench Press',
      sets: 3,
      reps: '8-12',
      rest: '90s',
      muscleGroup: 'Chest'
    });

    expect(exercise.id).toBeDefined();
    expect(exercise.name).toBe('Bench Press');
    expect(exercise.sets).toBe(3);
    expect(exercise.muscleGroup).toBe('Chest');
  });
});
