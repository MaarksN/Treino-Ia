import { ValidationError } from '../exceptions/DomainError';

export class CNPJ {
  private readonly value: string;

  constructor(value: string) {
    const sanitizedValue = value.replace(/[^\d]+/g, '');
    if (!this.isValid(sanitizedValue)) {
      throw new ValidationError(`Invalid CNPJ: ${value}`);
    }
    this.value = sanitizedValue;
  }

  private isValid(cnpj: string): boolean {
    if (cnpj.length !== 14) return false;

    // Check for common invalid sequences
    if (/^(\d)\1+$/.test(cnpj)) return false;

    // Basic mod 11 algorithm structure checking could be added here
    // For Enterprise milestone scaffold, we ensure format length
    return true;
  }

  public getValue(): string {
    return this.value;
  }

  public getFormattedValue(): string {
    return this.value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }

  public equals(other: CNPJ): boolean {
    return this.value === other.getValue();
  }
}
