import { describe, it, expect, vi } from 'vitest';
import { QualifyLeadUseCase } from './QualifyLeadUseCase';
import { ILeadRepository } from '../../domain/repositories/ILeadRepository';
import { Lead } from '../../domain/entities/Lead';

describe('QualifyLeadUseCase', () => {
  it('should qualify lead and update its status based on score', async () => {
    const mockLead = Lead.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      score: 10,
    }, 'lead-123');

    const mockRepo: ILeadRepository = {
      findById: vi.fn().mockResolvedValue(mockLead),
      findByEmail: vi.fn(),
      save: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
    };

    const useCase = new QualifyLeadUseCase(mockRepo);
    const result = await useCase.execute('lead-123', 80);

    expect(mockRepo.update).toHaveBeenCalled();
    expect(result.score).toBe(80);
    expect(result.status).toBe('qualified');
  });
});
