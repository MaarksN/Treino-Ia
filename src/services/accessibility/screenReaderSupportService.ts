/**
 * Item 93 — Screen Reader Support Service
 *
 * Provides checklist and helpers for screen reader compatibility.
 * Does NOT claim full WCAG compliance — this requires external audit.
 */

export interface LandmarkCheckItem {
  id: string;
  label: string;
  selector: string;
  description: string;
  present: boolean;
}

const LANDMARK_CHECKS: Omit<LandmarkCheckItem, 'present'>[] = [
  { id: 'main', label: 'Conteúdo principal', selector: 'main', description: 'Elemento <main> presente na página.' },
  { id: 'nav', label: 'Navegação', selector: 'nav', description: 'Elemento <nav> presente para navegação.' },
  { id: 'header', label: 'Cabeçalho', selector: 'header', description: 'Elemento <header> presente.' },
  { id: 'h1', label: 'Título principal', selector: 'h1', description: 'Elemento <h1> único na página.' },
  { id: 'aria-live', label: 'Região live', selector: '[aria-live]', description: 'Região aria-live para anúncios dinâmicos.' },
  { id: 'skip-link', label: 'Skip link', selector: 'a[href="#main-content"], a[href="#dashboard-overview"]', description: 'Link para pular para o conteúdo principal.' },
];

export function runLandmarkAudit(): LandmarkCheckItem[] {
  if (typeof document === 'undefined') {
    return LANDMARK_CHECKS.map(check => ({ ...check, present: false }));
  }

  return LANDMARK_CHECKS.map(check => ({
    ...check,
    present: document.querySelector(check.selector) !== null,
  }));
}

export function getLandmarkScore(checks: LandmarkCheckItem[]): { passed: number; total: number; percentage: number } {
  const total = checks.length;
  const passed = checks.filter(c => c.present).length;
  return {
    passed,
    total,
    percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
  };
}

export function announceToScreenReader(message: string): void {
  if (typeof document === 'undefined') return;
  if (!message.trim()) return;

  let region = document.getElementById('treino-ia-sr-announcer');
  if (!region) {
    region = document.createElement('div');
    region.id = 'treino-ia-sr-announcer';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('role', 'status');
    region.style.position = 'absolute';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.overflow = 'hidden';
    region.style.clip = 'rect(0,0,0,0)';
    region.style.whiteSpace = 'nowrap';
    document.body.appendChild(region);
  }

  // Clear then set to trigger announcement
  region.textContent = '';
  requestAnimationFrame(() => {
    region!.textContent = message;
  });
}

export const SCREEN_READER_DISCLAIMER =
  'A auditoria de landmarks é uma verificação básica. Acessibilidade completa requer testes com leitores de tela reais (NVDA, VoiceOver, TalkBack) e auditoria profissional WCAG.';
