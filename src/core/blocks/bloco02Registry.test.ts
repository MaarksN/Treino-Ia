import { describe, expect, it } from 'vitest';
import { assertAuthenticatedUser, assertServerSourceOfTruth, bloco02Items, summarizeBloco02 } from './bloco02Registry';
describe('Bloco 02 — Treino e Execução', () => {
  it('mapeia 20 itens', () => { expect(bloco02Items).toHaveLength(20); });
  it('não fica production-ready com itens pendentes', () => { expect(summarizeBloco02().readyForProduction).toBe(false); });
  it('exige usuário autenticado', () => { expect(() => assertAuthenticatedUser()).toThrow(); expect(assertAuthenticatedUser('user-123456')).toBe('user-123456'); });
  it('bloqueia mock/localStorage como fonte de verdade', () => { expect(() => assertServerSourceOfTruth('server')).not.toThrow(); expect(() => assertServerSourceOfTruth('localStorage')).toThrow(); expect(() => assertServerSourceOfTruth('mock')).toThrow(); });
});
