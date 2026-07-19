import { describe, it, expect } from 'vitest';
import { WorkoutVolume } from './WorkoutVolume';
import { ValidationError } from '../exceptions/DomainError';

describe('WorkoutVolume Value Object', () => {
  it('should create a valid volume', () => {
    const volume = new WorkoutVolume(1500);
    expect(volume.getValue()).toBe(1500);
  });

  it('should throw ValidationError for negative volumes', () => {
    expect(() => new WorkoutVolume(-50)).toThrow(ValidationError);
  });
});
