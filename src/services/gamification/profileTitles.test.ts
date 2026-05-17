import { describe, expect, it } from 'vitest';
import { getProfileTitle } from './profileTitles';

describe('profileTitles', () => {
  it('returns correct title', () => {
    expect(getProfileTitle(2, 1)).toBe('Iniciante da Forja');
    expect(getProfileTitle(25, 10)).toBe('Guardião da Forja');
  });
});
