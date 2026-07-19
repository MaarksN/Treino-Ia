import { describe, it, expect, vi } from 'vitest';
import { CreateUserUseCase } from './CreateUserUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { DomainError } from '../../domain/exceptions/DomainError';

describe('CreateUserUseCase', () => {
  it('should create and save a new user successfully', async () => {
    const mockRepo: IUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreateUserUseCase(mockRepo);
    const result = await useCase.execute({
      email: 'new@example.com',
      name: 'New User',
    });

    expect(mockRepo.findByEmail).toHaveBeenCalledWith('new@example.com');
    expect(mockRepo.save).toHaveBeenCalled();
    expect(result.email).toBe('new@example.com');
    expect(result.name).toBe('New User');
    expect(result.id).toBeDefined();
    expect(result.notificationsEnabled).toBe(true);
  });

  it('should throw DomainError if user already exists', async () => {
    const mockUser = User.create({ email: 'existing@example.com' });
    const mockRepo: IUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreateUserUseCase(mockRepo);

    await expect(useCase.execute({ email: 'existing@example.com' }))
      .rejects.toThrow(DomainError);
    await expect(useCase.execute({ email: 'existing@example.com' }))
      .rejects.toThrow('User with email existing@example.com already exists');

    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
