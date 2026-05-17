import { AppTheme } from '../types';

export const APP_THEMES: AppTheme[] = [
  {
    id: 'dark',
    name: 'Noir',
    description: 'Escuro clássico com neon verde',
    emoji: '🌑',
    isPremium: false,
    vars: {
      '--color-brand-neon': '#a3e635',
      '--color-brand-neon-hover': '#84cc16',
      '--color-brand-magenta': '#f43f5e',
      '--color-brand-dark': '#0a0a0a',
      '--color-brand-gray': '#141413',
      '--color-brand-surface': '#1a1917',
      '--color-brand-light': '#f8fafc',
      '--color-brand-muted': '#6b7280',
      '--gradient-hero': 'linear-gradient(135deg, #0a0a0a 0%, #1a1917 100%)',
    },
  },
  {
    id: 'fire',
    name: 'Fire',
    description: 'Vermelho e laranja intensos',
    emoji: '🔥',
    isPremium: false,
    vars: {
      '--color-brand-neon': '#f97316',
      '--color-brand-neon-hover': '#ea580c',
      '--color-brand-magenta': '#ef4444',
      '--color-brand-dark': '#0f0500',
      '--color-brand-gray': '#1a0800',
      '--color-brand-surface': '#220c00',
      '--color-brand-light': '#fff7ed',
      '--color-brand-muted': '#fb923c',
      '--gradient-hero': 'linear-gradient(135deg, #0f0500 0%, #3b1200 100%)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Azul profundo e turquesa',
    emoji: '🌊',
    isPremium: false,
    vars: {
      '--color-brand-neon': '#22d3ee',
      '--color-brand-neon-hover': '#06b6d4',
      '--color-brand-magenta': '#38bdf8',
      '--color-brand-dark': '#010f18',
      '--color-brand-gray': '#031825',
      '--color-brand-surface': '#041e2f',
      '--color-brand-light': '#ecfeff',
      '--color-brand-muted': '#67e8f9',
      '--gradient-hero': 'linear-gradient(135deg, #010f18 0%, #041e2f 100%)',
    },
  },
  {
    id: 'neon',
    name: 'Cyberpunk',
    description: 'Roxo e rosa neon futurista',
    emoji: '🤖',
    isPremium: true,
    vars: {
      '--color-brand-neon': '#e879f9',
      '--color-brand-neon-hover': '#d946ef',
      '--color-brand-magenta': '#f472b6',
      '--color-brand-dark': '#050008',
      '--color-brand-gray': '#0d0014',
      '--color-brand-surface': '#12001c',
      '--color-brand-light': '#faf5ff',
      '--color-brand-muted': '#c084fc',
      '--gradient-hero': 'linear-gradient(135deg, #050008 0%, #12001c 50%, #00040f 100%)',
    },
  },
  {
    id: 'gold',
    name: 'Champion',
    description: 'Dourado e preto para campeões',
    emoji: '👑',
    isPremium: true,
    vars: {
      '--color-brand-neon': '#fbbf24',
      '--color-brand-neon-hover': '#f59e0b',
      '--color-brand-magenta': '#f97316',
      '--color-brand-dark': '#080500',
      '--color-brand-gray': '#100b00',
      '--color-brand-surface': '#1a1100',
      '--color-brand-light': '#fffbeb',
      '--color-brand-muted': '#fde68a',
      '--gradient-hero': 'linear-gradient(135deg, #080500 0%, #1a1100 100%)',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Cinza frio e branco clean',
    emoji: '⬜',
    isPremium: true,
    vars: {
      '--color-brand-neon': '#f1f5f9',
      '--color-brand-neon-hover': '#cbd5e1',
      '--color-brand-magenta': '#94a3b8',
      '--color-brand-dark': '#020617',
      '--color-brand-gray': '#0f172a',
      '--color-brand-surface': '#1e293b',
      '--color-brand-light': '#f8fafc',
      '--color-brand-muted': '#94a3b8',
      '--gradient-hero': 'linear-gradient(135deg, #020617 0%, #1e293b 100%)',
    },
  },
];

const THEME_KEY = '@TreinoApp:themeId';
const BLOCKED_THEME_KEY = '@TreinoApp:blockedPremiumThemeId';

export interface ThemeAccessResult {
  theme: AppTheme;
  allowed: boolean;
  reason?: 'premium_required';
}

export interface ThemeApplyResult extends ThemeAccessResult {
  applied: boolean;
}

export function loadThemeId(): string {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

export function getTheme(themeId: string): AppTheme {
  return APP_THEMES.find(theme => theme.id === themeId) || APP_THEMES[0];
}

export function getThemeAccess(themeId: string, isPremium = false): ThemeAccessResult {
  const theme = getTheme(themeId);

  if (theme.isPremium && !isPremium) {
    return { theme, allowed: false, reason: 'premium_required' };
  }

  return { theme, allowed: true };
}

export function applyTheme(
  themeId: string,
  options: { enforcePremium?: boolean; isPremium?: boolean } = {},
): ThemeApplyResult {
  const access = getThemeAccess(themeId, options.isPremium);
  if (options.enforcePremium && !access.allowed) {
    localStorage.setItem(BLOCKED_THEME_KEY, access.theme.id);
    return { ...access, applied: false };
  }

  const theme = getTheme(themeId);
  const root = document.documentElement;

  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.style.setProperty('--color-white', theme.vars['--color-brand-light'] || '#f8fafc');

  localStorage.setItem(THEME_KEY, theme.id);
  localStorage.removeItem(BLOCKED_THEME_KEY);

  return { theme, allowed: true, applied: true };
}

export function loadBlockedPremiumThemeId(): string | null {
  return localStorage.getItem(BLOCKED_THEME_KEY);
}
