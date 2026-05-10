import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  canUseFeature,
  incrementAiUsage,
  loadEntitlement,
  startSevenDayTrial,
} from '../src/utils/premiumUtils';

describe('premiumUtils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T12:00:00Z'));
  });

  it('cria entitlement free por padrão', () => {
    const state = loadEntitlement();

    expect(state.planId).toBe('free');
    expect(state.isPremium).toBe(false);
    expect(state.unlockedFeatures).toEqual([]);
  });

  it('bloqueia IA ilimitada quando o limite free mensal é atingido', () => {
    for (let index = 0; index < 10; index += 1) {
      incrementAiUsage();
    }

    expect(canUseFeature('unlimited_ai')).toEqual({
      allowed: false,
      reason: 'Limite mensal de IA atingido no plano Free.',
    });
  });

  it('ativa trial premium com recursos desbloqueados por 7 dias', () => {
    const state = startSevenDayTrial();

    expect(state.isPremium).toBe(true);
    expect(state.billingStatus).toBe('trialing');
    expect(state.unlockedFeatures).toContain('unlimited_ai');
    expect(canUseFeature('premium_theme').allowed).toBe(true);
  });
});
