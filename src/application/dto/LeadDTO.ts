export interface LeadDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organizationId?: string;
  status: string;
  score: number;
}

export type CreateLeadRequestDTO = Pick<LeadDTO, 'firstName' | 'lastName' | 'email' | 'phone' | 'organizationId'>;
