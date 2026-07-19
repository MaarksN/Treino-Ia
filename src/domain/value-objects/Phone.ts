import { ValidationError } from '../exceptions/DomainError';

export class Phone {
  private readonly value: string;

  constructor(value: string) {
    const sanitizedValue = value.replace(/[^\d+]+/g, '');
    if (!this.isValid(sanitizedValue)) {
      throw new ValidationError(`Invalid Phone number: ${value}`);
    }
    this.value = sanitizedValue;
  }

  private isValid(phone: string): boolean {
    return phone.length >= 8 && phone.length <= 15;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Phone): boolean {
    return this.value === other.getValue();
  }
}
