export interface OrganizationDTO {
  id: string;
  name: string;
  cnpj?: string;
  website?: string;
  industry?: string;
  size?: number;
}

export type CreateOrganizationRequestDTO = Omit<OrganizationDTO, 'id'>;
