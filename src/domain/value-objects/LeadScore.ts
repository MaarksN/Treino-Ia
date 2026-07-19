import { ValidationError } from '../exceptions/DomainError';

export class LeadScore {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new ValidationError(`Invalid LeadScore: ${value}. Must be between 0 and 100.`);
    }
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }

  public getClassification(): 'cold' | 'warm' | 'hot' {
    if (this.value < 40) return 'cold';
    if (this.value < 75) return 'warm';
    return 'hot';
  }

  public equals(other: LeadScore): boolean {
    return this.value === other.getValue();
  }
}
