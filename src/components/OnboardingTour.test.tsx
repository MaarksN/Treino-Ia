import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingTour } from './OnboardingTour';

/**
 * OnboardingTour Component Test — Controlled Technical Sprint 05.
 *
 * Tests the onboarding tour overlay:
 *   1. Renders first step with welcome title.
 *   2. "Próximo" advances to next step.
 *   3. "Anterior" goes back to previous step.
 *   4. Last step shows "Começar" button.
 *   5. Clicking "Começar" calls onComplete.
 *   6. Clicking "Pular" calls onSkip.
 *   7. Renders correct number of step indicators.
 *
 * Constraints:
 *   - No API calls, no OAuth, no secrets.
 *   - State is internal useState — deterministic.
 */

describe('OnboardingTour', () => {
  const onComplete = vi.fn();
  const onSkip = vi.fn();

  beforeEach(() => {
    onComplete.mockClear();
    onSkip.mockClear();
  });

  it('renders the first step with welcome title', () => {
    render(<OnboardingTour onComplete={onComplete} onSkip={onSkip} />);

    expect(screen.getByText('Bem-vindo ao Treino IA')).toBeInTheDocument();
    expect(screen.getByText(/saber o que treinar hoje/i)).toBeInTheDocument();
  });

  it('advances to next step when clicking "Próximo"', () => {
    render(<OnboardingTour onComplete={onComplete} onSkip={onSkip} />);

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));

    expect(screen.getByText('Anamnese objetiva')).toBeInTheDocument();
  });

  it('goes back to previous step when clicking "Anterior"', () => {
    render(<OnboardingTour onComplete={onComplete} onSkip={onSkip} />);

    // Go forward
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    expect(screen.getByText('Anamnese objetiva')).toBeInTheDocument();

    // Go back
    fireEvent.click(screen.getByRole('button', { name: /anterior/i }));
    expect(screen.getByText('Bem-vindo ao Treino IA')).toBeInTheDocument();
  });

  it('shows "Começar" button on the last step', () => {
    render(<OnboardingTour onComplete={onComplete} onSkip={onSkip} />);

    // Navigate to last step (7 steps total, click 6 times)
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    }

    expect(screen.getByText('Pronto para começar!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /começar/i })).toBeInTheDocument();
  });

  it('calls onComplete when "Começar" is clicked', () => {
    render(<OnboardingTour onComplete={onComplete} onSkip={onSkip} />);

    // Navigate to last step
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    }

    fireEvent.click(screen.getByRole('button', { name: /começar/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('calls onSkip when "Pular" is clicked', () => {
    render(<OnboardingTour onComplete={onComplete} onSkip={onSkip} />);

    fireEvent.click(screen.getByRole('button', { name: /pular/i }));

    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('renders correct number of step indicators', () => {
    const { container } = render(<OnboardingTour onComplete={onComplete} onSkip={onSkip} />);

    // 7 step dots
    const stepDots = container.querySelectorAll('.rounded-full.transition-all.duration-300');
    expect(stepDots.length).toBe(7);
  });
});
