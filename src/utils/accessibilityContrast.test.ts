import { describe, expect, it } from 'vitest';
import {
  auditCriticalContrast,
  getContrastRatio,
  getCriticalContrastClass,
  isAccessibleContrast,
} from './accessibilityContrast';

describe('accessibilityContrast', () => {
  it('calcula contraste WCAG entre preto e branco', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBe(21);
    expect(isAccessibleContrast('#000', '#fff')).toBe(true);
  });

  it('mantem superficies criticas acima de AA para texto normal', () => {
    const surfaces = ['primaryAction', 'activeSelection', 'positiveStatus', 'warningStatus', 'neutralPanel'] as const;

    surfaces.forEach(surface => {
      expect(auditCriticalContrast(surface).passesAaText).toBe(true);
    });
  });

  it('retorna classes reutilizaveis para componentes criticos', () => {
    expect(getCriticalContrastClass('primaryAction')).toContain('bg-brand-neon');
    expect(getCriticalContrastClass('warningStatus')).toContain('border-brand-magenta');
  });
});
