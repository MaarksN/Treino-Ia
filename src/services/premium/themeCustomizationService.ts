/**
 * Item 18 — Theme Customization Service (Premium Preview)
 *
 * Allows local theme customization as a premium preview.
 * Does NOT create billing, charge users, or fake entitlement.
 * All themes are locally previewed; premium enforcement requires real billing.
 */

import { APP_THEMES, applyTheme, getTheme, loadThemeId } from '../../utils/themeUtils';

export type ThemeVariant = 'neon' | 'high_contrast' | 'minimal' | 'performance_dark';

export interface ThemePreviewOption {
  id: string;
  variant: ThemeVariant;
  name: string;
  description: string;
  isPremium: boolean;
}

const VARIANT_MAP: Record<ThemeVariant, string> = {
  neon: 'neon',
  high_contrast: 'dark',
  minimal: 'minimal',
  performance_dark: 'dark',
};

const STORAGE_KEY = '@TreinoIA:premium:selectedThemeVariant';

export function getThemePreviewOptions(): ThemePreviewOption[] {
  return [
    { id: 'neon', variant: 'neon', name: 'Cyberpunk Neon', description: 'Roxo e rosa neon futurista', isPremium: true },
    { id: 'high_contrast', variant: 'high_contrast', name: 'Alto Contraste', description: 'Contraste máximo para legibilidade', isPremium: false },
    { id: 'minimal', variant: 'minimal', name: 'Minimal', description: 'Cinza frio e branco clean', isPremium: true },
    { id: 'performance_dark', variant: 'performance_dark', name: 'Performance Dark', description: 'Escuro puro para economia de bateria', isPremium: false },
  ];
}

export function applyThemeVariant(variant: ThemeVariant): { applied: boolean; reason: string } {
  const themeId = VARIANT_MAP[variant] ?? 'dark';
  const theme = getTheme(themeId);

  // Apply locally without premium enforcement (preview mode)
  const result = applyTheme(themeId, { enforcePremium: false });
  localStorage.setItem(STORAGE_KEY, variant);

  return {
    applied: result.applied,
    reason: result.applied
      ? `Tema "${theme.name}" aplicado localmente como preview.`
      : `Não foi possível aplicar o tema "${theme.name}".`,
  };
}

export function getSelectedVariant(): ThemeVariant | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && Object.keys(VARIANT_MAP).includes(raw)) return raw as ThemeVariant;
    return null;
  } catch {
    return null;
  }
}

export function getCurrentThemeInfo(): { id: string; name: string; isPremium: boolean } {
  const themeId = loadThemeId();
  const theme = APP_THEMES.find(t => t.id === themeId) ?? APP_THEMES[0];
  return { id: theme.id, name: theme.name, isPremium: theme.isPremium };
}

export const PREMIUM_THEME_DISCLAIMER =
  'Temas premium estão em modo de preview local. Billing real não está ativo. A aplicação do tema é funcional para fins de demonstração.';
