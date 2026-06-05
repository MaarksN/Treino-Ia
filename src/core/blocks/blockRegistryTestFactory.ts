import { describe, expect, it } from 'vitest';
import type { BlockItem, BlockSummary } from './blockRegistryFactory';

interface BlockRegistryContract {
  items: BlockItem[];
  summarize: () => BlockSummary;
  assertAuthenticatedUser: (userId?: string) => string;
  assertServerSourceOfTruth: (source: 'server' | 'client' | 'localStorage' | 'mock') => void;
}

export function describeBlockRegistry(title: string, registry: BlockRegistryContract) {
  describe(title, () => {
    it('mapeia 20 itens', () => {
      expect(registry.items).toHaveLength(20);
    });

    it('não fica production-ready com itens pendentes', () => {
      expect(registry.summarize().readyForProduction).toBe(false);
    });

    it('exige usuário autenticado', () => {
      expect(() => registry.assertAuthenticatedUser()).toThrow();
      expect(registry.assertAuthenticatedUser('user-123456')).toBe('user-123456');
    });

    it('bloqueia mock/localStorage como fonte de verdade', () => {
      expect(() => registry.assertServerSourceOfTruth('server')).not.toThrow();
      expect(() => registry.assertServerSourceOfTruth('localStorage')).toThrow();
      expect(() => registry.assertServerSourceOfTruth('mock')).toThrow();
    });
  });
}
