import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkoutSession } from '../database';
import { workoutHistoryRepository } from './workoutHistoryRepository';
import { legacyWorkoutHistoryAdapter } from './legacyWorkoutHistoryAdapter';
import { workoutSessionRepository } from './workoutSessionRepository';

vi.mock('./legacyWorkoutHistoryAdapter', () => ({
  legacyWorkoutHistoryAdapter: {
    saveLegacyJson: vi.fn(),
    getLegacyHistory: vi.fn(),
  },
}));

vi.mock('./workoutSessionRepository', () => ({
  workoutSessionRepository: {
    saveCompletedSession: vi.fn(),
    listCompletedSessions: vi.fn(),
  },
}));

const session = {
  id: 'session-1',
  planId: 'plan-1',
  dayId: 'day-1',
  dayName: 'Dia 1',
  focus: 'Superior',
  completedAt: Date.now(),
  durationMinutes: 45,
  totalVolume: 1000,
  completedExercises: 1,
  totalExercises: 1,
  feedback: '',
  nextRecommendation: '',
  exercises: [],
} satisfies WorkoutSession;

describe('workoutHistoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves legacy JSON first and then attempts relational dual-write', async () => {
    await workoutHistoryRepository.saveWorkout(session);

    expect(legacyWorkoutHistoryAdapter.saveLegacyJson).toHaveBeenCalledWith(session);
    expect(workoutSessionRepository.saveCompletedSession).toHaveBeenCalledWith(session);
  });

  it('returns relational history when available', async () => {
    vi.mocked(workoutSessionRepository.listCompletedSessions).mockResolvedValue([session]);

    await expect(workoutHistoryRepository.getHistory()).resolves.toEqual([session]);
    expect(legacyWorkoutHistoryAdapter.getLegacyHistory).not.toHaveBeenCalled();
  });

  it('falls back to legacy JSON history when relational history is empty', async () => {
    vi.mocked(workoutSessionRepository.listCompletedSessions).mockResolvedValue([]);
    vi.mocked(legacyWorkoutHistoryAdapter.getLegacyHistory).mockResolvedValue([session]);

    await expect(workoutHistoryRepository.getHistory()).resolves.toEqual([session]);
  });
});
