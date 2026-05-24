import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApplyProgressionSuggestion } from './useApplyProgressionSuggestion';
import type { ProgressionSuggestion } from '../rules/progressionRules';

// Mock the analytics hook
vi.mock('./useAnalytics', () => ({
  useAnalytics: () => ({ track: vi.fn() }),
}));

function makeSuggestion(overrides: Partial<ProgressionSuggestion> = {}): ProgressionSuggestion {
  return {
    exerciseId: 'ex1',
    exerciseName: 'Supino Reto',
    previousLoad: 80,
    suggestedLoad: 82.5,
    delta: 2.5,
    action: 'increase',
    confidence: 'high',
    reason: 'Boa execução.',
    ...overrides,
  };
}

describe('useApplyProgressionSuggestion', () => {
  it('acceptSuggestion calls onApplyLoad with suggested load', () => {
    const onApplyLoad = vi.fn();
    const suggestion = makeSuggestion();

    const { result } = renderHook(() =>
      useApplyProgressionSuggestion(suggestion, onApplyLoad)
    );

    act(() => {
      result.current.acceptSuggestion();
    });

    expect(onApplyLoad).toHaveBeenCalledWith(82.5);
    expect(result.current.isDismissed).toBe(true);
  });

  it('rejectSuggestion sets isDismissed to true', () => {
    const onApplyLoad = vi.fn();
    const suggestion = makeSuggestion();

    const { result } = renderHook(() =>
      useApplyProgressionSuggestion(suggestion, onApplyLoad)
    );

    act(() => {
      result.current.rejectSuggestion();
    });

    expect(onApplyLoad).not.toHaveBeenCalled();
    expect(result.current.isDismissed).toBe(true);
  });

  it('handles null suggestion gracefully', () => {
    const onApplyLoad = vi.fn();

    const { result } = renderHook(() =>
      useApplyProgressionSuggestion(null, onApplyLoad)
    );

    // Should not crash
    act(() => {
      result.current.acceptSuggestion();
    });

    expect(onApplyLoad).not.toHaveBeenCalled();

    act(() => {
      result.current.rejectSuggestion();
    });

    // isDismissed stays false for null suggestion since rejectSuggestion
    // guards on !suggestion
    expect(result.current.isDismissed).toBe(false);
  });

  it('starts with isDismissed false', () => {
    const { result } = renderHook(() =>
      useApplyProgressionSuggestion(makeSuggestion(), vi.fn())
    );

    expect(result.current.isDismissed).toBe(false);
  });
});
