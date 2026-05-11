import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkoutExecutionPayload } from '../types/trainingExecution';

vi.mock('./supabaseClient', () => ({
  isSupabaseConfigured: false,
  supabase: {},
}));

describe('training execution mock_dev_only fallbacks', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists workout execution as mock_dev_only when Supabase is unavailable', async () => {
    const { persistWorkoutExecution } = await import('./workoutExecutionService');
    const payload: WorkoutExecutionPayload = {
      record: {
        id: '11111111-1111-1111-1111-111111111111',
        date: Date.now(),
        planId: 'plan-1',
        dayId: 'day-1',
        dayName: 'Dia 1',
        focus: 'Força',
        volumeLoad: 1000,
        durationMinutes: 35,
        exercises: [],
      },
      session: {
        id: 'session-1',
        planId: 'plan-1',
        dayId: 'day-1',
        completedAt: Date.now(),
        logs: [],
      },
      personalRecords: [],
    };

    await expect(persistWorkoutExecution(payload)).resolves.toMatchObject({
      dataMode: 'mock_dev_only',
      recordId: payload.record.id,
    });
    expect(window.localStorage.getItem('@TreinoApp:workoutExecutions:mock_dev_only')).toContain(payload.record.id);
  });

  it('rejects invalid custom exercise before any persistence attempt', async () => {
    const { createCustomExercise } = await import('./exerciseLibraryService');

    await expect(createCustomExercise({
      name: 'A',
      muscleGroup: 'Peito',
      movementPattern: 'Empurrar',
      tags: [],
    })).rejects.toThrow('ao menos 3 caracteres');
  });

  it('marks favorites as mock_dev_only when user is unauthenticated', async () => {
    const { toggleExerciseFavorite } = await import('./exerciseLibraryService');

    await expect(toggleExerciseFavorite('e001', [])).resolves.toEqual({
      dataMode: 'mock_dev_only',
      favoriteIds: ['e001'],
    });
    expect(window.localStorage.getItem('@TreinoApp:favExercises:mock_dev_only')).toContain('e001');
  });
});
