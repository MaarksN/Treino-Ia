import { describe, it, expect } from 'vitest';
import { User } from './User';

describe('User Entity', () => {
  it('should create a valid user with generated ID', () => {
    const user = User.create({ email: 'test@example.com', name: 'John Doe' });
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('John Doe');
    expect(user.notificationsEnabled).toBe(true);
  });

  it('should restore an existing user with provided ID', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const user = User.create({ email: 'existing@example.com' }, id);
    expect(user.id).toBe(id);
    expect(user.email).toBe('existing@example.com');
    expect(user.name).toBeUndefined();
  });

  it('should throw an error if email is invalid', () => {
    expect(() => User.create({ email: 'not-an-email' })).toThrowError();
  });
});
