import { describe, it, expect } from 'vitest';
import { calculateEcoLiftingImpact } from './ecoLiftingService';
import { WorkoutSession } from '../../services/database';

describe('ecoLiftingService', () => {
  it('should return initial stats for empty history', () => {
    const stats = calculateEcoLiftingImpact([]);
    expect(stats.score).toBe(0);
    expect(stats.badges).toHaveLength(0);
    expect(stats.message).toContain('compromisso');
  });

  it('should calculate eco points and badges based on history size', () => {
    const mockHistory = Array.from({ length: 6 }).map((_, i) => ({
      id: `session-${i}`,
      planId: 'p1',
      dayId: 'd1',
      dayName: 'Day 1',
      focus: 'Hypertrophy',
      completedAt: Date.now(),
      durationMinutes: 45,
      totalVolume: 1000,
      completedExercises: 5,
      totalExercises: 5,
      feedback: 'Good',
      nextRecommendation: 'Keep it up',
      exercises: [],
    } as WorkoutSession));

    const stats = calculateEcoLiftingImpact(mockHistory);
    expect(stats.score).toBe(60);
    expect(stats.badges).toContain('Garrafa Reutilizável Iniciante');
    expect(stats.badges).toContain('Treino Consistente Sustentável');
    expect(stats.badges).not.toContain('Defensor Local do Eco-lifting');
  });
});
