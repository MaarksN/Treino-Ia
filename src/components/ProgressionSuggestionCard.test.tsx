import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressionSuggestionCard } from './ProgressionSuggestionCard';
import type { ProgressionSuggestion } from '../rules/progressionRules';

function makeSuggestion(overrides: Partial<ProgressionSuggestion> = {}): ProgressionSuggestion {
  return {
    exerciseId: 'ex1',
    exerciseName: 'Supino Reto',
    previousLoad: 80,
    suggestedLoad: 82.5,
    delta: 2.5,
    action: 'increase',
    confidence: 'high',
    reason: 'Boa execução com esforço controlado. Aumentar carga.',
    ...overrides,
  };
}

describe('ProgressionSuggestionCard', () => {
  it('renders suggestion for increase action', () => {
    const onAccept = vi.fn();
    const onDismiss = vi.fn();

    render(
      <ProgressionSuggestionCard
        suggestion={makeSuggestion()}
        onAccept={onAccept}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByTestId('progression-suggestion-card')).toBeTruthy();
    expect(screen.getByText('82.5kg')).toBeTruthy();
    expect(screen.getByText('Sugestão inteligente')).toBeTruthy();
  });

  it('renders previous load and suggested load', () => {
    render(
      <ProgressionSuggestionCard
        suggestion={makeSuggestion({ previousLoad: 60, suggestedLoad: 62.5, delta: 2.5 })}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByText('60kg')).toBeTruthy();
    expect(screen.getByText('62.5kg')).toBeTruthy();
    expect(screen.getByText('(+2.5kg)')).toBeTruthy();
  });

  it('renders decrease action with amber accent', () => {
    render(
      <ProgressionSuggestionCard
        suggestion={makeSuggestion({
          action: 'decrease',
          suggestedLoad: 75,
          delta: -5,
          reason: 'Falha detectada no último treino.',
        })}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByText('75kg')).toBeTruthy();
    expect(screen.getByText('(-5kg)')).toBeTruthy();
  });

  it('calls onAccept when Aceitar is clicked', () => {
    const onAccept = vi.fn();

    render(
      <ProgressionSuggestionCard
        suggestion={makeSuggestion()}
        onAccept={onAccept}
        onDismiss={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('progression-accept-btn'));
    expect(onAccept).toHaveBeenCalledOnce();
  });

  it('calls onDismiss when Manter Atual is clicked', () => {
    const onDismiss = vi.fn();

    render(
      <ProgressionSuggestionCard
        suggestion={makeSuggestion()}
        onAccept={vi.fn()}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(screen.getByTestId('progression-dismiss-btn'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('returns null for insufficient_data action', () => {
    const { container } = render(
      <ProgressionSuggestionCard
        suggestion={makeSuggestion({ action: 'insufficient_data' })}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('returns null when suggestedLoad is undefined', () => {
    const { container } = render(
      <ProgressionSuggestionCard
        suggestion={makeSuggestion({ suggestedLoad: undefined })}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('does not crash with missing optional fields', () => {
    const { container } = render(
      <ProgressionSuggestionCard
        suggestion={makeSuggestion({
          previousLoad: undefined,
          delta: undefined,
          exerciseName: undefined,
        })}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(container.innerHTML).not.toBe('');
  });
});
