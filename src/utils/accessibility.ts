export type FontScale = 's' | 'm' | 'l' | 'xl';

const SCALE: Record<FontScale, string> = {
  s: '0.95',
  m: '1',
  l: '1.1',
  xl: '1.22',
};

export function applyFontScale(scale: FontScale) {
  document.documentElement.style.setProperty('font-size', `${Number(SCALE[scale]) * 16}px`);
  localStorage.setItem('@TreinoApp:font-scale', scale);
}

export function applyHighContrast(enabled: boolean) {
  document.documentElement.classList.toggle('treino-high-contrast', enabled);
  localStorage.setItem('@TreinoApp:high-contrast', String(enabled));
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
