import { describe, it, expect, vi } from 'vitest';
import { LogWorkoutSessionUseCase } from './LogWorkoutSessionUseCase';
import { ITrainingRepository } from '../../domain/repositories/ITrainingRepository';

describe('LogWorkoutSessionUseCase', () => {
  it('should create and save a new workout session', async () => {
    const mockRepo: ITrainingRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new LogWorkoutSessionUseCase(mockRepo);
    const result = await useCase.execute({
      planId: 'plan-1',
      dayId: 'day-1',
      userId: 'user-1',
      durationMinutes: 60,
      totalVolume: 10000,
      logs: [
        { exerciseId: 'ex-1', exerciseName: 'Squat', setsCompleted: 4, totalVolumeLifted: 10000 }
      ]
    });

    expect(mockRepo.save).toHaveBeenCalled();
    expect(result.id).toBeDefined();
    expect(result.completedAt).toBeDefined();
    expect(result.totalVolume).toBe(10000);
    expect(result.logs[0].exerciseName).toBe('Squat');
  });
});
