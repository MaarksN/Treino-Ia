import { describe, expect, it } from 'vitest';
import { assertAuthenticatedUser, assertServerSourceOfTruth, bloco15Items, summarizeBloco15 } from './bloco15Registry';
describe('Bloco 15 — Wearables Integrações Externas', () => {
  it('mapeia 20 itens', () => { expect(bloco15Items).toHaveLength(20); });
  it('não fica production-ready com itens pendentes', () => { expect(summarizeBloco15().readyForProduction).toBe(false); });
  it('exige usuário autenticado', () => { expect(() => assertAuthenticatedUser()).toThrow(); expect(assertAuthenticatedUser('user-123456')).toBe('user-123456'); });
  it('bloqueia mock/localStorage como fonte de verdade', () => { expect(() => assertServerSourceOfTruth('server')).not.toThrow(); expect(() => assertServerSourceOfTruth('localStorage')).toThrow(); expect(() => assertServerSourceOfTruth('mock')).toThrow(); });
});
