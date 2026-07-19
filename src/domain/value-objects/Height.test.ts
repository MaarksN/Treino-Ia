import { describe, it, expect } from 'vitest';
import { Height } from './Height';
import { ValidationError } from '../exceptions/DomainError';

describe('Height Value Object', () => {
  it('should create a valid height', () => {
    const height = new Height(180);
    expect(height.getValue()).toBe(180);
  });

  it('should throw ValidationError for invalid heights', () => {
    expect(() => new Height(-10)).toThrow(ValidationError);
    expect(() => new Height(0)).toThrow(ValidationError);
    expect(() => new Height(350)).toThrow(ValidationError);
  });

  it('should equal another height with the same value', () => {
    const height1 = new Height(175);
    const height2 = new Height(175);
    expect(height1.equals(height2)).toBe(true);
  });
});
