import { Entity } from './Entity';
import { CNPJ } from '../value-objects/CNPJ';
import { URL as URLValueObject } from '../value-objects/URL';

interface OrganizationProps {
  name: string;
  cnpj?: CNPJ;
  website?: URLValueObject;
  industry?: string;
  size?: number;
}

export class Organization extends Entity<OrganizationProps> {
  private constructor(props: OrganizationProps, id?: string) {
    super(props, id);
  }

  public static create(props: { name: string; cnpj?: string; website?: string; industry?: string; size?: number }, id?: string): Organization {
    return new Organization({
      name: props.name,
      cnpj: props.cnpj ? new CNPJ(props.cnpj) : undefined,
      website: props.website ? new URLValueObject(props.website) : undefined,
      industry: props.industry,
      size: props.size,
    }, id);
  }

  get name(): string { return this.props.name; }
  get cnpj(): string | undefined { return this.props.cnpj?.getValue(); }
  get website(): string | undefined { return this.props.website?.getValue(); }
  get industry(): string | undefined { return this.props.industry; }
  get size(): number | undefined { return this.props.size; }
}
