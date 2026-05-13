import { describe, expect, it } from 'vitest';
import { assertAuthenticatedUser, assertServerSourceOfTruth, bloco06Items, summarizeBloco06 } from './bloco06Registry';
describe('Bloco 06 — Inteligência Corporal', () => {
  it('mapeia 20 itens', () => { expect(bloco06Items).toHaveLength(20); });
  it('não fica production-ready com itens pendentes', () => { expect(summarizeBloco06().readyForProduction).toBe(false); });
  it('exige usuário autenticado', () => { expect(() => assertAuthenticatedUser()).toThrow(); expect(assertAuthenticatedUser('user-123456')).toBe('user-123456'); });
  it('bloqueia mock/localStorage como fonte de verdade', () => { expect(() => assertServerSourceOfTruth('server')).not.toThrow(); expect(() => assertServerSourceOfTruth('localStorage')).toThrow(); expect(() => assertServerSourceOfTruth('mock')).toThrow(); });
});
