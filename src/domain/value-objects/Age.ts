import { ValidationError } from '../exceptions/DomainError';

export class Age {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0 || value > 120) {
      throw new ValidationError(`Invalid age: ${value}. Must be between 0 and 120.`);
    }
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: Age): boolean {
    return this.value === other.getValue();
  }
}
