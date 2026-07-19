import { describe, it, expect } from 'vitest';
import { UserProfile } from './UserProfile';

describe('UserProfile Entity', () => {
  it('should create a valid UserProfile', () => {
    const profile = UserProfile.create({
      userId: 'user-123',
      age: 25,
      gender: 'male',
      weight: 80,
      height: 180,
      experienceLevel: 'advanced',
      goal: 'hypertrophy',
      daysPerWeek: 4,
      injuries: 'none',
    });

    expect(profile.id).toBeDefined();
    expect(profile.userId).toBe('user-123');
    expect(profile.age).toBe(25);
    expect(profile.weight).toBe(80);
    expect(profile.height).toBe(180);
    expect(profile.experienceLevel).toBe('advanced');
    expect(profile.goal).toBe('hypertrophy');
  });

  it('should throw an error for invalid age during creation', () => {
    expect(() => UserProfile.create({
      userId: 'user-123',
      age: -5,
      gender: 'male',
      weight: 80,
      height: 180,
      experienceLevel: 'advanced',
      goal: 'hypertrophy',
      daysPerWeek: 4,
      injuries: 'none',
    })).toThrowError();
  });
});
