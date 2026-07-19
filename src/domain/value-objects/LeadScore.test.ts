import { describe, it, expect } from 'vitest';
import { LeadScore } from './LeadScore';
import { ValidationError } from '../exceptions/DomainError';

describe('LeadScore Value Object', () => {
  it('should create a valid LeadScore', () => {
    const score = new LeadScore(85);
    expect(score.getValue()).toBe(85);
    expect(score.getClassification()).toBe('hot');
  });

  it('should throw ValidationError for invalid scores', () => {
    expect(() => new LeadScore(-1)).toThrow(ValidationError);
    expect(() => new LeadScore(101)).toThrow(ValidationError);
  });
});
