import { Lead } from '../entities/Lead';

export interface ILeadRepository {
  findById(id: string): Promise<Lead | null>;
  findByEmail(email: string): Promise<Lead | null>;
  save(lead: Lead): Promise<void>;
  update(lead: Lead): Promise<void>;
  delete(id: string): Promise<void>;
}
