import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyThemeVariant,
  getCurrentThemeInfo,
  getSelectedVariant,
  getThemePreviewOptions,
  PREMIUM_THEME_DISCLAIMER,
} from './themeCustomizationService';

describe('themeCustomizationService', () => {
  beforeEach(() => localStorage.clear());

  it('returns all theme preview options', () => {
    const options = getThemePreviewOptions();
    expect(options.length).toBe(4);
    expect(options.some(o => o.variant === 'neon')).toBe(true);
    expect(options.some(o => o.variant === 'minimal')).toBe(true);
  });

  it('applies theme variant and persists', () => {
    const result = applyThemeVariant('performance_dark');
    expect(result.applied).toBe(true);
    expect(result.reason).toContain('preview');
    expect(getSelectedVariant()).toBe('performance_dark');
  });

  it('returns null when no variant is selected', () => {
    expect(getSelectedVariant()).toBeNull();
  });

  it('returns current theme info', () => {
    const info = getCurrentThemeInfo();
    expect(info.id).toBeTruthy();
    expect(info.name).toBeTruthy();
    expect(typeof info.isPremium).toBe('boolean');
  });

  it('has a premium disclaimer', () => {
    expect(PREMIUM_THEME_DISCLAIMER.length).toBeGreaterThan(20);
    expect(PREMIUM_THEME_DISCLAIMER).toContain('preview');
  });
});
