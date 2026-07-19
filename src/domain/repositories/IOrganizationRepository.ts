import { Organization } from '../entities/Organization';

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findByCnpj(cnpj: string): Promise<Organization | null>;
  save(org: Organization): Promise<void>;
  update(org: Organization): Promise<void>;
  delete(id: string): Promise<void>;
}
