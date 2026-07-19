import { describe, it, expect } from 'vitest';
import { URL as URLValueObject } from './URL';
import { ValidationError } from '../exceptions/DomainError';

describe('URL Value Object', () => {
  it('should create a valid URL', () => {
    const url = new URLValueObject('https://example.com');
    expect(url.getValue()).toBe('https://example.com');
  });

  it('should throw ValidationError for invalid URLs', () => {
    expect(() => new URLValueObject('not-a-url')).toThrow(ValidationError);
  });
});
