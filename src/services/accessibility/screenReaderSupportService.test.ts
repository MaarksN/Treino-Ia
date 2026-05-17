import { beforeEach, describe, expect, it } from 'vitest';
import {
  announceToScreenReader,
  getLandmarkScore,
  runLandmarkAudit,
  SCREEN_READER_DISCLAIMER,
  type LandmarkCheckItem,
} from './screenReaderSupportService';

describe('screenReaderSupportService', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.getElementById('treino-ia-sr-announcer')?.remove();
  });

  it('returns all landmark checks', () => {
    const checks = runLandmarkAudit();
    expect(checks.length).toBeGreaterThanOrEqual(5);
    expect(checks.every(c => typeof c.present === 'boolean')).toBe(true);
  });

  it('detects present landmarks', () => {
    document.body.innerHTML = '<main></main><nav></nav>';
    const checks = runLandmarkAudit();
    const mainCheck = checks.find(c => c.id === 'main');
    const navCheck = checks.find(c => c.id === 'nav');
    expect(mainCheck?.present).toBe(true);
    expect(navCheck?.present).toBe(true);
  });

  it('calculates score correctly', () => {
    const checks: LandmarkCheckItem[] = [
      { id: 'a', label: 'A', selector: 'a', description: '', present: true },
      { id: 'b', label: 'B', selector: 'b', description: '', present: false },
      { id: 'c', label: 'C', selector: 'c', description: '', present: true },
    ];
    const score = getLandmarkScore(checks);
    expect(score.passed).toBe(2);
    expect(score.total).toBe(3);
    expect(score.percentage).toBe(67);
  });

  it('creates live region for announcements', () => {
    announceToScreenReader('Teste de anúncio');
    const region = document.getElementById('treino-ia-sr-announcer');
    expect(region).not.toBeNull();
    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.getAttribute('role')).toBe('status');
  });

  it('does not announce empty messages', () => {
    announceToScreenReader('   ');
    const region = document.getElementById('treino-ia-sr-announcer');
    expect(region).toBeNull();
  });

  it('has a disclaimer', () => {
    expect(SCREEN_READER_DISCLAIMER.length).toBeGreaterThan(20);
  });
});
