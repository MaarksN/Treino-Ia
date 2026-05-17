import { describe, it, expect } from 'vitest';
import { getOfflineMediaForExercise } from '../../src/pages/Dashboard/services/socialContent/offlineMediaService';

describe('offlineMediaService', () => {
  it('returns chest SVG for supino', () => {
    const result = getOfflineMediaForExercise('Supino Reto');
    expect(result).toContain('brand-neon');
    expect(result).toContain('rect');
  });

  it('returns leg SVG for agachamento', () => {
    const result = getOfflineMediaForExercise('Agachamento Livre');
    expect(result).toContain('brand-magenta');
    expect(result).toContain('path');
  });

  it('returns generic SVG for unknown exercise', () => {
    const result = getOfflineMediaForExercise('Exercício Muito Diferente');
    expect(result).toContain('brand-muted');
    expect(result).toContain('stroke-dasharray');
  });
});
