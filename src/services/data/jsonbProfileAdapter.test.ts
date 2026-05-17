import { describe, expect, it } from 'vitest';
import { adaptProfile, extractProfileLevel, isProfileComplete } from './jsonbProfileAdapter';

describe('jsonbProfileAdapter', () => {
  it('adapts a valid profile row from JSON', () => {
    const profile = adaptProfile({
      profile_json: {
        id: 'p1',
        name: 'Maria',
        level: 'avancado',
        goal: 'Hipertrofia',
        daysPerWeek: 5,
        timePerWorkout: 60,
        injuries: 'Nenhuma',
        equipment: 'Academia completa',
      },
    });

    expect(profile).not.toBeNull();
    expect(profile!.name).toBe('Maria');
    expect(profile!.level).toBe('avancado');
    expect(profile!.daysPerWeek).toBe(5);
  });

  it('returns null for null/undefined row', () => {
    expect(adaptProfile(null)).toBeNull();
    expect(adaptProfile(undefined)).toBeNull();
  });

  it('returns null when no JSON and no relational columns', () => {
    expect(adaptProfile({ profile_json: 'not_an_object' })).toBeNull();
    expect(adaptProfile({})).toBeNull();
  });

  it('falls back to relational columns when JSON is missing', () => {
    const profile = adaptProfile({
      profile_name: 'Carlos',
      profile_goal: 'Emagrecimento',
    });

    expect(profile).not.toBeNull();
    expect(profile!.name).toBe('Carlos');
    expect(profile!.goal).toBe('Emagrecimento');
  });

  it('normalizes invalid levels', () => {
    const profile = adaptProfile({
      profile_json: { id: 'p2', name: 'Test', level: 'pro_gamer' },
    });

    expect(profile!.level).toBe('intermediario');
  });

  it('extracts valid training levels', () => {
    expect(extractProfileLevel('avancado')).toBe('avancado');
    expect(extractProfileLevel('iniciante')).toBe('iniciante');
    expect(extractProfileLevel('fake')).toBe('intermediario');
    expect(extractProfileLevel(42)).toBe('intermediario');
  });

  it('checks profile completeness', () => {
    expect(isProfileComplete(null)).toBe(false);
    expect(isProfileComplete({
      id: 'p1', name: 'A', level: 'iniciante', goal: 'B',
      daysPerWeek: 3, timePerWorkout: 30, injuries: '', equipment: '',
    })).toBe(true);
    expect(isProfileComplete({
      id: 'p1', name: '', level: 'iniciante', goal: 'B',
      daysPerWeek: 3, timePerWorkout: 30, injuries: '', equipment: '',
    })).toBe(false);
  });
});
