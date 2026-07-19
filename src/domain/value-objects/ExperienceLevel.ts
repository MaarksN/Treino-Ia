import { ValidationError } from '../exceptions/DomainError';

export type ExperienceLevelValue = 'beginner' | 'intermediate' | 'advanced';

export class ExperienceLevel {
  private readonly value: ExperienceLevelValue;

  constructor(value: string) {
    const validLevels: ExperienceLevelValue[] = ['beginner', 'intermediate', 'advanced'];
    const normalizedValue = value.toLowerCase() as ExperienceLevelValue;

    if (!validLevels.includes(normalizedValue)) {
      throw new ValidationError(`Invalid experience level: ${value}. Must be beginner, intermediate, or advanced.`);
    }
    this.value = normalizedValue;
  }

  public getValue(): ExperienceLevelValue {
    return this.value;
  }

  public equals(other: ExperienceLevel): boolean {
    return this.value === other.getValue();
  }
}
