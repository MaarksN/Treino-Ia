import { describe, it, expect, vi } from 'vitest';
import { CreateUserProfileUseCase } from './CreateUserProfileUseCase';
import { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { UserProfile } from '../../domain/entities/UserProfile';
import { DomainError } from '../../domain/exceptions/DomainError';

describe('CreateUserProfileUseCase', () => {
  it('should create and save a new user profile successfully', async () => {
    const mockRepo: IUserProfileRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreateUserProfileUseCase(mockRepo);
    const result = await useCase.execute({
      userId: 'user-123',
      age: 25,
      gender: 'male',
      weight: 80,
      height: 180,
      experienceLevel: 'advanced',
      goal: 'hypertrophy',
      daysPerWeek: 4,
      injuries: 'none',
    });

    expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-123');
    expect(mockRepo.save).toHaveBeenCalled();
    expect(result.userId).toBe('user-123');
    expect(result.id).toBeDefined();
  });

  it('should throw DomainError if profile already exists', async () => {
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
    });

    const mockRepo: IUserProfileRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn().mockResolvedValue(mockProfile),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreateUserProfileUseCase(mockRepo);

    await expect(useCase.execute({
      userId: 'user-123',
      age: 25,
      gender: 'male',
      weight: 80,
      height: 180,
      experienceLevel: 'advanced',
      goal: 'hypertrophy',
      daysPerWeek: 4,
      injuries: 'none',
    })).rejects.toThrow(DomainError);

    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
