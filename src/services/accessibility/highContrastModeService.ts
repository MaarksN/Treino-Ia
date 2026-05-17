/**
 * Item 92 — High Contrast Mode Service
 *
 * Manages the high contrast mode toggle with local persistence.
 * Applies the `treino-high-contrast` class (already defined in index.css)
 * to the document root element.
 */

const STORAGE_KEY = '@TreinoIA:accessibility:highContrast';
const CLASS_NAME = 'treino-high-contrast';

export function isHighContrastEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setHighContrastEnabled(enabled: boolean): boolean {
  const safeEnabled = Boolean(enabled);
  localStorage.setItem(STORAGE_KEY, String(safeEnabled));
  applyHighContrastToDOM(safeEnabled);
  return safeEnabled;
}

export function toggleHighContrast(): boolean {
  return setHighContrastEnabled(!isHighContrastEnabled());
}

export function applyHighContrastToDOM(enabled: boolean): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (enabled) {
    root.classList.add(CLASS_NAME);
    root.setAttribute('data-high-contrast', 'true');
  } else {
    root.classList.remove(CLASS_NAME);
    root.removeAttribute('data-high-contrast');
  }
}

/** Call once on app init to restore persisted state */
export function restoreHighContrastFromStorage(): void {
  applyHighContrastToDOM(isHighContrastEnabled());
}
