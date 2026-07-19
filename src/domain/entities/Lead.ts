import { Entity } from './Entity';
import { Email } from '../value-objects/Email';
import { Phone } from '../value-objects/Phone';
import { LeadScore } from '../value-objects/LeadScore';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';

interface LeadProps {
  firstName: string;
  lastName: string;
  email: Email;
  phone?: Phone;
  organizationId?: string;
  status: LeadStatus;
  score: LeadScore;
}

export class Lead extends Entity<LeadProps> {
  private constructor(props: LeadProps, id?: string) {
    super(props, id);
  }

  public static create(props: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    organizationId?: string;
    status?: LeadStatus;
    score?: number;
  }, id?: string): Lead {
    return new Lead({
      firstName: props.firstName,
      lastName: props.lastName,
      email: new Email(props.email),
      phone: props.phone ? new Phone(props.phone) : undefined,
      organizationId: props.organizationId,
      status: props.status ?? 'new',
      score: new LeadScore(props.score ?? 0),
    }, id);
  }

  public qualify(newScore: number): void {
    this.props.score = new LeadScore(newScore);
    if (this.props.score.getClassification() === 'hot') {
      this.props.status = 'qualified';
    }
  }

  get firstName(): string { return this.props.firstName; }
  get lastName(): string { return this.props.lastName; }
  get email(): string { return this.props.email.getValue(); }
  get phone(): string | undefined { return this.props.phone?.getValue(); }
  get organizationId(): string | undefined { return this.props.organizationId; }
  get status(): LeadStatus { return this.props.status; }
  get score(): number { return this.props.score.getValue(); }
}
