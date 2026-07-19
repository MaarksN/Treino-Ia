import { ValidationError } from '../exceptions/DomainError';

export class URL {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new ValidationError(`Invalid URL: ${value}`);
    }
    this.value = value.trim();
  }

  private isValid(url: string): boolean {
    try {
      new globalThis.URL(url);
      return true;
    } catch {
      return false;
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: URL): boolean {
    return this.value === other.getValue();
  }
}
