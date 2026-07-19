import { describe, it, expect, vi } from 'vitest';
import { CreateOrganizationUseCase } from './CreateOrganizationUseCase';
import { IOrganizationRepository } from '../../domain/repositories/IOrganizationRepository';
import { Organization } from '../../domain/entities/Organization';
import { DomainError } from '../../domain/exceptions/DomainError';

describe('CreateOrganizationUseCase', () => {
  it('should create and save a new organization successfully', async () => {
    const mockRepo: IOrganizationRepository = {
      findById: vi.fn(),
      findByCnpj: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreateOrganizationUseCase(mockRepo);
    const result = await useCase.execute({
      name: 'Test Corp',
      cnpj: '12.345.678/0001-95',
    });

    expect(mockRepo.findByCnpj).toHaveBeenCalledWith('12345678000195');
    expect(mockRepo.save).toHaveBeenCalled();
    expect(result.id).toBeDefined();
    expect(result.name).toBe('Test Corp');
  });

  it('should throw DomainError if organization with CNPJ exists', async () => {
    const mockOrg = Organization.create({ name: 'Existing', cnpj: '12345678000195' });
    const mockRepo: IOrganizationRepository = {
      findById: vi.fn(),
      findByCnpj: vi.fn().mockResolvedValue(mockOrg),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreateOrganizationUseCase(mockRepo);
    await expect(useCase.execute({ name: 'Test Corp', cnpj: '12.345.678/0001-95' })).rejects.toThrow(DomainError);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
