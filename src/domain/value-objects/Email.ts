import { ValidationError } from '../exceptions/DomainError';

export class Email {
  private readonly value: string;

  constructor(value: string) {
    const sanitizedValue = value.toLowerCase().trim();
    if (!this.isValid(sanitizedValue)) {
      throw new ValidationError(`Invalid email address: ${value}`);
    }
    this.value = sanitizedValue;
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.getValue();
  }
}
