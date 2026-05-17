import { describe, it, expect } from 'vitest';
import { getPainDrivenSuggestions } from './painDrivenSuggestions';

describe('painDrivenSuggestions', () => {
  it('should return actionable warning for high pain', () => {
    const result = getPainDrivenSuggestions({ bodyPart: 'Lombar', intensity: 8 });
    expect(result.isActionable).toBe(true);
    expect(result.message).toContain('dor intensa');
  });

  it('should return actionable warning for moderate pain', () => {
    const result = getPainDrivenSuggestions({ bodyPart: 'Ombro', intensity: 5 });
    expect(result.isActionable).toBe(true);
    expect(result.message).toContain('dor moderada');
  });

  it('should return non-actionable note for low pain', () => {
    const result = getPainDrivenSuggestions({ bodyPart: 'Joelho', intensity: 2 });
    expect(result.isActionable).toBe(false);
    expect(result.message).toContain('Leve desconforto');
  });
});
