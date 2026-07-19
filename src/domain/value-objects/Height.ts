import { ValidationError } from '../exceptions/DomainError';

export class Height {
  private readonly value: number;

  constructor(value: number) {
    if (value <= 0 || value > 300) {
      throw new ValidationError(`Invalid height: ${value}. Must be between 0 and 300 cm.`);
    }
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: Height): boolean {
    return this.value === other.getValue();
  }
}
