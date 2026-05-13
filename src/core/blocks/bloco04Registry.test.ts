import { describe, expect, it } from 'vitest';
import { assertAuthenticatedUser, assertServerSourceOfTruth, bloco04Items, summarizeBloco04 } from './bloco04Registry';
describe('Bloco 04 — Nutrição Composição Analytics', () => {
  it('mapeia 20 itens', () => { expect(bloco04Items).toHaveLength(20); });
  it('não fica production-ready com itens pendentes', () => { expect(summarizeBloco04().readyForProduction).toBe(false); });
  it('exige usuário autenticado', () => { expect(() => assertAuthenticatedUser()).toThrow(); expect(assertAuthenticatedUser('user-123456')).toBe('user-123456'); });
  it('bloqueia mock/localStorage como fonte de verdade', () => { expect(() => assertServerSourceOfTruth('server')).not.toThrow(); expect(() => assertServerSourceOfTruth('localStorage')).toThrow(); expect(() => assertServerSourceOfTruth('mock')).toThrow(); });
});
