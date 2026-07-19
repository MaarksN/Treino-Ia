import { describe, it, expect } from 'vitest';
import { Phone } from './Phone';
import { ValidationError } from '../exceptions/DomainError';

describe('Phone Value Object', () => {
  it('should create a valid Phone from formatted input', () => {
    const phone = new Phone('+55 (11) 98765-4321');
    expect(phone.getValue()).toBe('+5511987654321');
  });

  it('should throw ValidationError for invalid phone lengths', () => {
    expect(() => new Phone('123')).toThrow(ValidationError);
  });
});
