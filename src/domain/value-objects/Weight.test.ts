import { describe, it, expect } from 'vitest';
import { Weight } from './Weight';
import { ValidationError } from '../exceptions/DomainError';

describe('Weight Value Object', () => {
  it('should create a valid weight', () => {
    const weight = new Weight(75.5);
    expect(weight.getValue()).toBe(75.5);
  });

  it('should throw ValidationError for invalid weights', () => {
    expect(() => new Weight(-10)).toThrow(ValidationError);
    expect(() => new Weight(0)).toThrow(ValidationError);
    expect(() => new Weight(600)).toThrow(ValidationError);
  });

  it('should equal another weight with the same value', () => {
    const weight1 = new Weight(80);
    const weight2 = new Weight(80);
    expect(weight1.equals(weight2)).toBe(true);
  });
});
