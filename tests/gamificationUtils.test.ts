import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addXp,
  buyCosmetic,
  calculateLevel,
  loadGamificationState,
  xpIntoCurrentLevel,
} from '../src/utils/gamificationUtils';

describe('gamificationUtils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T12:00:00Z'));
  });

  it('cria estado inicial consistente', () => {
    const state = loadGamificationState();

    expect(state.level).toBe(1);
    expect(state.coins).toBe(100);
    expect(state.cosmetics.some(item => item.unlocked)).toBe(true);
    expect(state.missions.length).toBeGreaterThan(0);
  });

  it('adiciona XP e recalcula nível/progresso', () => {
    const state = addXp('test', 500, 'Teste de XP');
    const progress = xpIntoCurrentLevel(state.xp);

    expect(state.xp).toBe(500);
    expect(state.level).toBe(calculateLevel(500));
    expect(progress.current).toBeGreaterThanOrEqual(0);
    expect(state.xpEvents[0].label).toBe('Teste de XP');
  });

  it('bloqueia compra cosmética sem moedas suficientes', () => {
    const result = buyCosmetic('effect_fire');

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Moedas insuficientes.');
  });
});
