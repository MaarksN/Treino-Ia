import { legacyWorkoutHistoryAdapter } from './legacyWorkoutHistoryAdapter';
import { workoutSessionRepository } from './workoutSessionRepository';
import type { WorkoutSession } from '../database';

export const workoutHistoryRepository = {
  async saveWorkout(session: WorkoutSession): Promise<void> {
    await legacyWorkoutHistoryAdapter.saveLegacyJson(session);

    try {
      await workoutSessionRepository.saveCompletedSession(session);
    } catch (error) {
      console.error('Failed relational dual-write, but legacy history was preserved.', error);
    }
  },

  async getHistory(limit = 50): Promise<WorkoutSession[]> {
    const relationalHistory = await workoutSessionRepository.listCompletedSessions(limit);

    if (relationalHistory.length > 0) {
      return relationalHistory;
    }

    return legacyWorkoutHistoryAdapter.getLegacyHistory(limit);
  },
};
