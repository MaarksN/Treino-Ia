import { beforeEach, describe, expect, it } from 'vitest';
import {
  getExplanation,
  getGlossary,
  isPlainLanguageEnabled,
  lookupTerm,
  setPlainLanguageEnabled,
  simplifyText,
  togglePlainLanguage,
} from './plainLanguageService';

describe('plainLanguageService', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to disabled', () => {
    expect(isPlainLanguageEnabled()).toBe(false);
  });

  it('enables and persists', () => {
    setPlainLanguageEnabled(true);
    expect(isPlainLanguageEnabled()).toBe(true);
  });

  it('toggles correctly', () => {
    expect(togglePlainLanguage()).toBe(true);
    expect(togglePlainLanguage()).toBe(false);
  });

  it('glossary has at least 10 entries', () => {
    expect(getGlossary().length).toBeGreaterThanOrEqual(10);
  });

  it('looks up terms case-insensitively', () => {
    expect(lookupTerm('rpe')).not.toBeNull();
    expect(lookupTerm('RPE')).not.toBeNull();
    expect(lookupTerm('nonexistent')).toBeNull();
  });

  it('returns technical or plain explanation', () => {
    const technical = getExplanation('RPE', false);
    const plain = getExplanation('RPE', true);
    expect(technical).toContain('Perceived Exertion');
    expect(plain).toContain('nota de 1 a 10');
  });

  it('simplifies text when enabled', () => {
    const original = 'Seu RPE está alto, considere um deload.';
    const simplified = simplifyText(original, true);
    expect(simplified).toContain('nota de 1 a 10');
    expect(simplified).toContain('semana mais leve');
  });

  it('returns original text when plain mode is off', () => {
    const original = 'Seu RPE está alto.';
    expect(simplifyText(original, false)).toBe(original);
  });
});
