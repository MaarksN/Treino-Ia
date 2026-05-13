import { describe, expect, it } from 'vitest';
import { assertAuthenticatedUser, assertServerSourceOfTruth, bloco05Items, summarizeBloco05 } from './bloco05Registry';
describe('Bloco 05 — Retenção Hábito Social Operação', () => {
  it('mapeia 20 itens', () => { expect(bloco05Items).toHaveLength(20); });
  it('não fica production-ready com itens pendentes', () => { expect(summarizeBloco05().readyForProduction).toBe(false); });
  it('exige usuário autenticado', () => { expect(() => assertAuthenticatedUser()).toThrow(); expect(assertAuthenticatedUser('user-123456')).toBe('user-123456'); });
  it('bloqueia mock/localStorage como fonte de verdade', () => { expect(() => assertServerSourceOfTruth('server')).not.toThrow(); expect(() => assertServerSourceOfTruth('localStorage')).toThrow(); expect(() => assertServerSourceOfTruth('mock')).toThrow(); });
});
