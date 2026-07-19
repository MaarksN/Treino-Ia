import { describe, it, expect, vi } from 'vitest';
import { UpdateUserProfileUseCase } from './UpdateUserProfileUseCase';
import { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { UserProfile } from '../../domain/entities/UserProfile';
import { NotFoundError } from '../../domain/exceptions/DomainError';

describe('UpdateUserProfileUseCase', () => {
  it('should update and save an existing user profile successfully', async () => {
    const mockProfile = UserProfile.create({
      userId: 'user-123',
      age: 25,
      gender: 'male',
      weight: 80,
      height: 180,
      experienceLevel: 'advanced',
      goal: 'hypertrophy',
      daysPerWeek: 4,
      injuries: 'none',
    }, 'profile-123');

    const mockRepo: IUserProfileRepository = {
      findById: vi.fn().mockResolvedValue(mockProfile),
      findByUserId: vi.fn(),
      save: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
    };

    const useCase = new UpdateUserProfileUseCase(mockRepo);
    const result = await useCase.execute('profile-123', {
      weight: 85, // Updated weight
      goal: 'strength', // Updated goal
    });

    expect(mockRepo.findById).toHaveBeenCalledWith('profile-123');
    expect(mockRepo.update).toHaveBeenCalled();
    expect(result.id).toBe('profile-123');
    expect(result.weight).toBe(85);
    expect(result.goal).toBe('strength');
    expect(result.age).toBe(25); // Unchanged
  });

  it('should throw NotFoundError if profile does not exist', async () => {
    const mockRepo: IUserProfileRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByUserId: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new UpdateUserProfileUseCase(mockRepo);

    await expect(useCase.execute('invalid-id', { weight: 80 })).rejects.toThrow(NotFoundError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
