import { describe, it, expect } from 'vitest';
import { buildRemoteGamifiedState } from './remoteGamifiedEngine';

describe('remoteGamifiedEngine', () => {
  const mockProfile: any = {
    id: '123',
    name: 'Test',
    goal: 'Hypertrophy',
    daysPerWeek: 5,
    timePerWorkout: 60,
    level: 'intermediate',
    equipment: 'full',
    injuries: 'none',
  };

  it('builds initial state correctly with empty history', () => {
    const state = buildRemoteGamifiedState(mockProfile, []);

    expect(state.coopGuard.isAvailable).toBe(false);
    expect(state.deathPenalty.isActive).toBe(false);
    expect(state.roguelike.isUnlocked).toBe(false);
    expect(state.cosmeticDrops.availableDrops).toBe(0);
    expect(state.musclePet.health).toBe(50);
  });

  it('unlocks features based on history length', () => {
    const history: any[] = Array.from({ length: 10 }).map((_, i) => ({
      id: `s${i}`,
      completedAt: Date.now() - i * 86400000,
      totalExercises: 5,
      completedExercises: 5,
      feedback: 'Good',
    }));

    const state = buildRemoteGamifiedState(mockProfile, history);

    expect(state.roguelike.isUnlocked).toBe(true);
    expect(state.cosmeticDrops.availableDrops).toBe(2);
    expect(state.cosmeticDrops.unlockedItems.length).toBeGreaterThan(0);
    expect(state.musclePet.health).toBe(100);
    expect(state.musclePet.happiness).toBe(100);
  });
});
