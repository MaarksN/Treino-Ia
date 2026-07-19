import { describe, it, expect } from 'vitest';
import { Age } from './Age';
import { ValidationError } from '../exceptions/DomainError';

describe('Age Value Object', () => {
  it('should create a valid age', () => {
    const age = new Age(30);
    expect(age.getValue()).toBe(30);
  });

  it('should throw ValidationError for invalid ages', () => {
    expect(() => new Age(-1)).toThrow(ValidationError);
    expect(() => new Age(150)).toThrow(ValidationError);
  });

  it('should equal another age with the same value', () => {
    const age1 = new Age(25);
    const age2 = new Age(25);
    expect(age1.equals(age2)).toBe(true);
  });
});
