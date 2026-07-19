import { describe, it, expect } from 'vitest';
import { Email } from './Email';
import { ValidationError } from '../exceptions/DomainError';

describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const email = new Email('test@example.com');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should trim and lowercase the email', () => {
    const email = new Email('  TEST@Example.com  ');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should throw ValidationError for invalid email formats', () => {
    expect(() => new Email('invalid-email')).toThrow(ValidationError);
    expect(() => new Email('@example.com')).toThrow(ValidationError);
    expect(() => new Email('test@')).toThrow(ValidationError);
  });

  it('should consider two emails equal if they have the same value', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('TEST@Example.com');
    expect(email1.equals(email2)).toBe(true);
  });
});
