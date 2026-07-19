import { ValidationError } from '../exceptions/DomainError';

export class Weight {
  private readonly value: number;

  constructor(value: number) {
    if (value <= 0 || value > 500) {
      throw new ValidationError(`Invalid weight: ${value}. Must be between 0 and 500 kg.`);
    }
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: Weight): boolean {
    return this.value === other.getValue();
  }
}
