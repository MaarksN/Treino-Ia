import { describe, it, expect } from 'vitest';
import { ExperienceLevel } from './ExperienceLevel';
import { ValidationError } from '../exceptions/DomainError';

describe('ExperienceLevel Value Object', () => {
  it('should create a valid experience level', () => {
    const level = new ExperienceLevel('beginner');
    expect(level.getValue()).toBe('beginner');
  });

  it('should normalize valid inputs', () => {
    const level = new ExperienceLevel('INTERMEDIATE');
    expect(level.getValue()).toBe('intermediate');
  });

  it('should throw ValidationError for invalid levels', () => {
    expect(() => new ExperienceLevel('expert')).toThrow(ValidationError);
  });
});
