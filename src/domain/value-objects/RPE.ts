import { ValidationError } from '../exceptions/DomainError';

export class RPE {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0 || value > 10) {
      throw new ValidationError(`Invalid RPE: ${value}. Must be between 0 and 10.`);
    }
    // ensure it's a whole number or .5
    if (value * 2 % 1 !== 0) {
      throw new ValidationError(`Invalid RPE: ${value}. Must be a multiple of 0.5.`);
    }
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: RPE): boolean {
    return this.value === other.getValue();
  }
}
