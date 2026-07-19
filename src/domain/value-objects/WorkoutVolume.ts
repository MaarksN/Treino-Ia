import { ValidationError } from '../exceptions/DomainError';

export class WorkoutVolume {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new ValidationError(`Invalid WorkoutVolume: ${value}. Cannot be negative.`);
    }
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: WorkoutVolume): boolean {
    return this.value === other.getValue();
  }
}
