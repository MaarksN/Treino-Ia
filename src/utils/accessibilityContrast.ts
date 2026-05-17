const luminanceMap = (value: number) => {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};

export const WCAG_AA_TEXT_RATIO = 4.5;
export const WCAG_AA_LARGE_TEXT_RATIO = 3;

export type CriticalContrastSurface =
  | 'primaryAction'
  | 'activeSelection'
  | 'positiveStatus'
  | 'warningStatus'
  | 'neutralPanel';

export interface ContrastAuditResult {
  ratio: number;
  passesAaText: boolean;
  passesAaLargeText: boolean;
}

export const BRAND_CONTRAST_HEX = {
  dark: '#030817',
  gray: '#120E2F',
  light: '#F8D77A',
  muted: '#9FB0D9',
  neon: '#19A7FF',
  magenta: '#8B5CF6',
  white: '#FFFFFF',
} as const;

export const criticalContrastSurfaces: Record<
  CriticalContrastSurface,
  {
    background: keyof typeof BRAND_CONTRAST_HEX;
    foreground: keyof typeof BRAND_CONTRAST_HEX;
    className: string;
  }
> = {
  primaryAction: {
    background: 'neon',
    foreground: 'dark',
    className: 'border-brand-neon bg-brand-neon text-brand-dark',
  },
  activeSelection: {
    background: 'neon',
    foreground: 'dark',
    className: 'border-brand-neon bg-brand-neon text-brand-dark shadow-brutal-neon',
  },
  positiveStatus: {
    background: 'dark',
    foreground: 'light',
    className: 'border-brand-neon bg-brand-dark text-brand-light',
  },
  warningStatus: {
    background: 'dark',
    foreground: 'light',
    className: 'border-brand-magenta bg-brand-dark text-brand-light',
  },
  neutralPanel: {
    background: 'gray',
    foreground: 'light',
    className: 'border-brand-light/15 bg-brand-gray text-brand-light',
  },
};

export function getContrastRatio(hexA: string, hexB: string): number {
  const parse = (hex: string) => {
    const normalized = hex.replace('#', '');
    const value = normalized.length === 3
      ? normalized.split('').map(char => char + char).join('')
      : normalized;
    const int = Number.parseInt(value, 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
  };

  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const l1 = 0.2126 * luminanceMap(r1) + 0.7152 * luminanceMap(g1) + 0.0722 * luminanceMap(b1);
  const l2 = 0.2126 * luminanceMap(r2) + 0.7152 * luminanceMap(g2) + 0.0722 * luminanceMap(b2);
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return Number(((light + 0.05) / (dark + 0.05)).toFixed(2));
}

export function isAccessibleContrast(hexA: string, hexB: string, largeText = false): boolean {
  return getContrastRatio(hexA, hexB) >= (largeText ? 3 : 4.5);
}

export function auditContrast(hexA: string, hexB: string): ContrastAuditResult {
  const ratio = getContrastRatio(hexA, hexB);
  return {
    ratio,
    passesAaText: ratio >= WCAG_AA_TEXT_RATIO,
    passesAaLargeText: ratio >= WCAG_AA_LARGE_TEXT_RATIO,
  };
}

export function getCriticalContrastClass(surface: CriticalContrastSurface): string {
  return criticalContrastSurfaces[surface].className;
}

export function auditCriticalContrast(surface: CriticalContrastSurface): ContrastAuditResult {
  const pair = criticalContrastSurfaces[surface];
  return auditContrast(BRAND_CONTRAST_HEX[pair.foreground], BRAND_CONTRAST_HEX[pair.background]);
}
