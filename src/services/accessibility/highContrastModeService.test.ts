import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyHighContrastToDOM,
  isHighContrastEnabled,
  setHighContrastEnabled,
  toggleHighContrast,
} from './highContrastModeService';

describe('highContrastModeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('treino-high-contrast');
    document.documentElement.removeAttribute('data-high-contrast');
  });

  it('defaults to disabled', () => {
    expect(isHighContrastEnabled()).toBe(false);
  });

  it('enables and persists', () => {
    setHighContrastEnabled(true);
    expect(isHighContrastEnabled()).toBe(true);
    expect(localStorage.getItem('@TreinoIA:accessibility:highContrast')).toBe('true');
  });

  it('disables and persists', () => {
    setHighContrastEnabled(true);
    setHighContrastEnabled(false);
    expect(isHighContrastEnabled()).toBe(false);
  });

  it('toggles correctly', () => {
    expect(toggleHighContrast()).toBe(true);
    expect(toggleHighContrast()).toBe(false);
  });

  it('applies class to DOM', () => {
    applyHighContrastToDOM(true);
    expect(document.documentElement.classList.contains('treino-high-contrast')).toBe(true);
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');

    applyHighContrastToDOM(false);
    expect(document.documentElement.classList.contains('treino-high-contrast')).toBe(false);
    expect(document.documentElement.getAttribute('data-high-contrast')).toBeNull();
  });
});
