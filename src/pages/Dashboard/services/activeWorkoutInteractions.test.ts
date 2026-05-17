import { describe, expect, it } from 'vitest';
import { getWorkoutSwipeResult, shouldIgnoreWorkoutSwipeTarget } from './activeWorkoutInteractions';

describe('activeWorkoutInteractions', () => {
  it('navega para proximo exercicio com swipe para esquerda', () => {
    expect(getWorkoutSwipeResult({ x: 240, y: 100 }, { x: 120, y: 110 }, 0, 3)).toMatchObject({
      action: 'next',
      nextIndex: 1,
    });
  });

  it('navega para exercicio anterior com swipe para direita', () => {
    expect(getWorkoutSwipeResult({ x: 100, y: 100 }, { x: 210, y: 112 }, 1, 3)).toMatchObject({
      action: 'previous',
      nextIndex: 0,
    });
  });

  it('ignora rolagem vertical e limites da lista', () => {
    expect(getWorkoutSwipeResult({ x: 100, y: 100 }, { x: 130, y: 220 }, 1, 3).reason).toBe('vertical_scroll');
    expect(getWorkoutSwipeResult({ x: 100, y: 100 }, { x: 240, y: 110 }, 0, 3).reason).toBe('boundary');
  });

  it('ignora alvos interativos para nao quebrar inputs', () => {
    const wrapper = document.createElement('div');
    const input = document.createElement('input');
    const plain = document.createElement('span');
    wrapper.append(input, plain);

    expect(shouldIgnoreWorkoutSwipeTarget(input)).toBe(true);
    expect(shouldIgnoreWorkoutSwipeTarget(plain)).toBe(false);
  });
});
