import { describe, it, expect } from 'vitest';
import { formatAIPersonality } from './aiPersonality';

describe('aiPersonality', () => {
  it('should format technical message', () => {
    const result = formatAIPersonality({ type: 'technical', baseMessage: 'Teste' });
    expect(result).toContain('[Análise Técnica]: Teste');
  });

  it('should format motivator message', () => {
    const result = formatAIPersonality({ type: 'motivator', baseMessage: 'Teste' });
    expect(result).toContain('[BOA!]: Teste');
  });

  it('should format friendly message', () => {
    const result = formatAIPersonality({ type: 'friendly', baseMessage: 'Teste' });
    expect(result).toContain('[Dica Amiga]: Teste');
  });
});
