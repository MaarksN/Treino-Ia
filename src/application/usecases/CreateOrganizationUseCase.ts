import { IOrganizationRepository } from '../../domain/repositories/IOrganizationRepository';
import { Organization } from '../../domain/entities/Organization';
import { CreateOrganizationRequestDTO, OrganizationDTO } from '../dto/OrganizationDTO';
import { DomainError } from '../../domain/exceptions/DomainError';
import { CNPJ } from '../../domain/value-objects/CNPJ';

export class CreateOrganizationUseCase {
  constructor(private readonly orgRepository: IOrganizationRepository) {}

  public async execute(request: CreateOrganizationRequestDTO): Promise<OrganizationDTO> {
    if (request.cnpj) {
      const cnpjVO = new CNPJ(request.cnpj);
      const existingOrg = await this.orgRepository.findByCnpj(cnpjVO.getValue());
      if (existingOrg) {
        throw new DomainError('ORG_ALREADY_EXISTS', `Organization with CNPJ ${request.cnpj} already exists`);
      }
    }

    const org = Organization.create(request);
    await this.orgRepository.save(org);

    return {
      id: org.id,
      name: org.name,
      cnpj: org.cnpj,
      website: org.website,
      industry: org.industry,
      size: org.size,
    };
  }
}
