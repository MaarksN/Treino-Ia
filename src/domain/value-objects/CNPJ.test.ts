import { describe, it, expect } from 'vitest';
import { CNPJ } from './CNPJ';
import { ValidationError } from '../exceptions/DomainError';

describe('CNPJ Value Object', () => {
  it('should create a valid CNPJ from formatted input', () => {
    const cnpj = new CNPJ('12.345.678/0001-95');
    expect(cnpj.getValue()).toBe('12345678000195');
    expect(cnpj.getFormattedValue()).toBe('12.345.678/0001-95');
  });

  it('should throw ValidationError for invalid CNPJ lengths', () => {
    expect(() => new CNPJ('123')).toThrow(ValidationError);
    expect(() => new CNPJ('12.345.678/0001-950')).toThrow(ValidationError);
  });

  it('should equal another CNPJ with the same value', () => {
    const cnpj1 = new CNPJ('12345678000195');
    const cnpj2 = new CNPJ('12.345.678/0001-95');
    expect(cnpj1.equals(cnpj2)).toBe(true);
  });
});
