import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserProfile, WorkoutHistoryRecord, WorkoutPlan } from '../types';
import { STORAGE_KEYS } from '../utils/storage';
import {
  loadLegacyTrainingStateFromLocalStorage,
  loadTrainingStateFromBackend,
  migrateLegacyTrainingStateToBackend,
  persistWorkoutHistoryToBackend,
  persistWorkoutPlansToBackend,
} from './legacyTrainingSyncService';

vi.mock('./supabaseClient', () => ({
  isSupabaseConfigured: false,
  supabase: {},
}));

const profile: UserProfile = {
  age: 32,
  gender: 'masculino',
  weight: 84,
  height: 178,
  experienceLevel: 'intermediario',
  goal: 'hipertrofia',
  daysPerWeek: 4,
  injuries: 'nenhuma',
};

const plan: WorkoutPlan = {
  id: 'plan-1',
  createdAt: 1778500000000,
  planName: 'Plano A',
  goalDescription: 'Hipertrofia',
  days: [
    {
      id: 'day-1',
      dayName: 'Push',
      focus: 'Peito',
      exercises: [],
    },
  ],
};

const historyRecord: WorkoutHistoryRecord = {
  id: 'hist-1',
  date: 1778500000000,
  planId: 'plan-1',
  dayId: 'day-1',
  dayName: 'Push',
  focus: 'Peito',
  volumeLoad: 4200,
  durationMinutes: 52,
  exercises: [],
};

describe('legacyTrainingSyncService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads and normalizes legacy profile, plans and history from localStorage', () => {
    window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    window.localStorage.setItem(STORAGE_KEYS.plans, JSON.stringify([plan]));
    window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify([historyRecord]));

    const state = loadLegacyTrainingStateFromLocalStorage();

    expect(state.profile).toMatchObject({ goal: 'hipertrofia', daysPerWeek: 4 });
    expect(state.plans).toHaveLength(1);
    expect(state.history).toHaveLength(1);
  });

  it('marks migration as mock_dev_only when Supabase auth is unavailable', async () => {
    window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    window.localStorage.setItem(STORAGE_KEYS.plans, JSON.stringify([plan]));
    window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify([historyRecord]));

    await expect(migrateLegacyTrainingStateToBackend()).resolves.toMatchObject({
      dataMode: 'mock_dev_only',
      profileMigrated: true,
      plansMigrated: 1,
      historyMigrated: 1,
    });

    expect(window.localStorage.getItem('@TreinoApp:legacyTrainingBackend:mock_dev_only')).toContain('profileMigrated');
  });

  it('persists plan and history sync attempts with explicit mock_dev_only metadata', async () => {
    await expect(persistWorkoutPlansToBackend([plan], plan.id)).resolves.toMatchObject({
      dataMode: 'mock_dev_only',
      plansMigrated: 1,
    });

    await expect(persistWorkoutHistoryToBackend([historyRecord])).resolves.toMatchObject({
      dataMode: 'mock_dev_only',
      historyMigrated: 1,
    });

    await expect(loadTrainingStateFromBackend()).resolves.toMatchObject({
      dataMode: 'mock_dev_only',
      plans: [expect.objectContaining({ id: 'plan-1' })],
      history: [expect.objectContaining({ id: 'hist-1' })],
    });
  });
});
