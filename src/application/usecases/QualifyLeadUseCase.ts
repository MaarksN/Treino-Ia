import { ILeadRepository } from '../../domain/repositories/ILeadRepository';
import { LeadDTO } from '../dto/LeadDTO';
import { NotFoundError } from '../../domain/exceptions/DomainError';

export class QualifyLeadUseCase {
  constructor(private readonly leadRepository: ILeadRepository) {}

  public async execute(leadId: string, newScore: number): Promise<LeadDTO> {
    const lead = await this.leadRepository.findById(leadId);

    if (!lead) {
      throw new NotFoundError('Lead', leadId);
    }

    lead.qualify(newScore);
    await this.leadRepository.update(lead);

    return {
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      organizationId: lead.organizationId,
      status: lead.status,
      score: lead.score,
    };
  }
}
