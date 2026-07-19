import { describe, it, expect } from 'vitest';
import { WorkoutSession } from './WorkoutSession';
import { ValidationError } from '../exceptions/DomainError';

describe('WorkoutSession Entity', () => {
  it('should create a valid WorkoutSession', () => {
    const session = WorkoutSession.create({
      planId: 'plan-123',
      dayId: 'day-1',
      userId: 'user-1',
      completedAt: Date.now(),
      durationMinutes: 45,
      totalVolume: 5000,
      logs: [
        { exerciseId: 'ex-1', exerciseName: 'Bench', setsCompleted: 3, totalVolumeLifted: 3000 },
        { exerciseId: 'ex-2', exerciseName: 'Fly', setsCompleted: 3, totalVolumeLifted: 2000 }
      ]
    });

    expect(session.id).toBeDefined();
    expect(session.totalVolume).toBe(5000);
    expect(session.logs.length).toBe(2);
    expect(session.logs[0].exerciseName).toBe('Bench');
  });

  it('should throw ValidationError if volume is negative', () => {
    expect(() => WorkoutSession.create({
      planId: 'plan-123',
      dayId: 'day-1',
      userId: 'user-1',
      completedAt: Date.now(),
      durationMinutes: 45,
      totalVolume: -100, // Invalid
      logs: []
    })).toThrow(ValidationError);
  });
});
