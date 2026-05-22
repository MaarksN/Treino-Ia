import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReadinessCard } from './ReadinessCard';
import { RecoveryCheckin } from '../types';

// Mock the personalization util
vi.mock('../utils/personalization', () => ({
  calculateReadiness: vi.fn((checkin) => ({
    label: checkin.energyLevel > 5 ? 'Pronto' : 'Descanso',
    score: checkin.energyLevel * 10
  }))
}));

describe('ReadinessCard', () => {
  it('renders placeholder when checkin is null', () => {
    render(<ReadinessCard checkin={null} />);
    expect(screen.getByText('Prontidão')).toBeInTheDocument();
    expect(screen.getByText(/Faça seu check-in/i)).toBeInTheDocument();
  });

  it('renders readiness metrics when checkin is provided', () => {
    const mockCheckin: RecoveryCheckin = {
      sleepHours: 8,
      stressLevel: 3,
      sorenessLevel: 2,
      energyLevel: 9,
      timestamp: 1696982400000
    };

    render(<ReadinessCard checkin={mockCheckin} />);
    
    // Check main labels and mocked response
    expect(screen.getByText('Prontidão do dia')).toBeInTheDocument();
    expect(screen.getByText('Pronto')).toBeInTheDocument();
    expect(screen.getByText('Score: 90')).toBeInTheDocument();

    // Check specific metrics mapped from the prop
    expect(screen.getByText('Sono: 8h')).toBeInTheDocument();
    expect(screen.getByText('Estresse: 3/10')).toBeInTheDocument();
    expect(screen.getByText('Dor muscular: 2/10')).toBeInTheDocument();
    expect(screen.getByText('Energia: 9/10')).toBeInTheDocument();
  });
});
