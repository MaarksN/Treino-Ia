import { beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, getThemeAccess, loadBlockedPremiumThemeId, loadThemeId } from './themeUtils';

describe('themeUtils premium guard', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('style');
  });

  it('bloqueia tema premium sem entitlement local informado', () => {
    const access = getThemeAccess('neon', false);
    const result = applyTheme('neon', { enforcePremium: true, isPremium: false });

    expect(access.allowed).toBe(false);
    expect(result.applied).toBe(false);
    expect(loadBlockedPremiumThemeId()).toBe('neon');
    expect(loadThemeId()).toBe('dark');
  });

  it('aplica tema gratuito sem depender de billing', () => {
    const result = applyTheme('fire', { enforcePremium: true, isPremium: false });

    expect(result.applied).toBe(true);
    expect(loadThemeId()).toBe('fire');
    expect(document.documentElement.style.getPropertyValue('--color-brand-neon')).toBe('#f97316');
  });

  it('permite tema premium quando entitlement ja foi validado pelo chamador', () => {
    const result = applyTheme('gold', { enforcePremium: true, isPremium: true });

    expect(result.applied).toBe(true);
    expect(loadThemeId()).toBe('gold');
    expect(loadBlockedPremiumThemeId()).toBeNull();
  });
});
