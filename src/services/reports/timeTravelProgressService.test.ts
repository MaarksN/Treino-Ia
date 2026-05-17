import { describe, it, expect } from 'vitest';
import { generateTimeTravelProgress } from './timeTravelProgressService';
import { WorkoutSession } from '../../services/database';

describe('timeTravelProgressService', () => {
  it('should return insufficient data message if history < 2', () => {
    const result = generateTimeTravelProgress([]);
    expect(result.hasEnoughData).toBe(false);
    expect(result.snapshots).toHaveLength(0);
  });

  it('should split history and compare based on real data', () => {
    const mockHistory = Array.from({ length: 4 }).map((_, i) => ({
      id: `s${i}`,
      planId: 'p1',
      dayId: 'd1',
      dayName: 'Day',
      focus: 'Strength',
      completedAt: Date.now() - i * 1000,
      durationMinutes: 45,
      totalVolume: 1000 + (i * 100), // volumes: [1000, 1100, 1200, 1300]
      completedExercises: 5,
      totalExercises: 5,
      feedback: 'Ok',
      nextRecommendation: 'Keep going',
      exercises: [],
    } as WorkoutSession));

    // Newer are index 0, 1 -> 1000, 1100 => 2100
    // Older are index 2, 3 -> 1200, 1300 => 2500
    const result = generateTimeTravelProgress(mockHistory);
    expect(result.hasEnoughData).toBe(true);
    expect(result.snapshots).toHaveLength(2);
    expect(result.snapshots[0].totalVolume).toBe(2500);
    expect(result.snapshots[1].totalVolume).toBe(2100);
  });
});
