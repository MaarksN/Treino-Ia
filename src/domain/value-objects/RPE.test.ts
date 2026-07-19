import { describe, it, expect } from 'vitest';
import { RPE } from './RPE';
import { ValidationError } from '../exceptions/DomainError';

describe('RPE Value Object', () => {
  it('should create a valid RPE', () => {
    const rpe1 = new RPE(8);
    const rpe2 = new RPE(8.5);
    expect(rpe1.getValue()).toBe(8);
    expect(rpe2.getValue()).toBe(8.5);
  });

  it('should throw ValidationError for RPEs outside bounds or invalid fractional values', () => {
    expect(() => new RPE(-1)).toThrow(ValidationError);
    expect(() => new RPE(11)).toThrow(ValidationError);
    expect(() => new RPE(8.2)).toThrow(ValidationError);
  });
});
