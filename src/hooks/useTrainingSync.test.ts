import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadTrainingStateFromBackend,
  migrateLegacyTrainingStateToBackend,
} from '../services/legacyTrainingSyncService';
import { useAppStore } from '../stores/useAppStore';
import type { UserProfile, WorkoutHistoryRecord, WorkoutPlan } from '../types';
import { captureError } from '../utils/errorTelemetry';
import { useTrainingSync } from './useTrainingSync';

vi.mock('../services/legacyTrainingSyncService', () => ({
  loadTrainingStateFromBackend: vi.fn(),
  migrateLegacyTrainingStateToBackend: vi.fn(),
}));

vi.mock('../utils/errorTelemetry', () => ({
  captureError: vi.fn(),
}));

const initialAppStoreState = useAppStore.getState();

const profile = {
  id: 'profile-1',
  goal: 'Forca',
  gender: 'nao informado',
  age: 32,
  weight: 80,
  height: 180,
  experienceLevel: 'intermediario',
  daysPerWeek: 4,
  injuries: 'nenhuma',
} as UserProfile;

const plan = {
  id: 'plan-1',
  planName: 'Plano A',
  goalDescription: 'Hipertrofia',
  createdAt: 1,
  days: [],
} as WorkoutPlan;

const historyRecord = {
  id: 'history-1',
  date: 1,
  planId: 'plan-1',
  dayId: 'day-1',
  dayName: 'Upper',
  focus: 'Peito',
  volumeLoad: 1000,
  durationMinutes: 50,
  exercises: [],
} as WorkoutHistoryRecord;

describe('useTrainingSync', () => {
  beforeEach(() => {
    useAppStore.setState(initialAppStoreState, true);
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('hydrates profile, plans, current plan and history from a mocked Supabase result', async () => {
    vi.mocked(loadTrainingStateFromBackend).mockResolvedValue({
      dataMode: 'supabase',
      user: null,
      profile,
      plans: [plan],
      history: [historyRecord],
      currentPlanId: 'plan-1',
    });
    const onGoToDashboard = vi.fn();
    const { result } = renderHook(() => useTrainingSync({ onGoToDashboard }));

    await act(async () => {
      await result.current.hydrateTrainingState();
    });

    const state = useAppStore.getState();
    expect(state.profile).toEqual(profile);
    expect(state.plans).toEqual([plan]);
    expect(state.currentPlanId).toBe('plan-1');
    expect(state.workoutHistory).toEqual([historyRecord]);
    expect(onGoToDashboard).toHaveBeenCalledTimes(1);
  });

  it('leaves the app store unchanged when backend data is not Supabase backed', async () => {
    vi.mocked(loadTrainingStateFromBackend).mockResolvedValue({
      dataMode: 'mock_dev_only',
      warning: 'mock mode',
      user: null,
      profile,
      plans: [plan],
      history: [historyRecord],
      currentPlanId: 'plan-1',
    });
    const onGoToDashboard = vi.fn();
    const { result } = renderHook(() => useTrainingSync({ onGoToDashboard }));

    await act(async () => {
      await result.current.hydrateTrainingState();
    });

    const state = useAppStore.getState();
    expect(state.profile).toBeNull();
    expect(state.plans).toEqual([]);
    expect(state.workoutHistory).toEqual([]);
    expect(onGoToDashboard).not.toHaveBeenCalled();
  });

  it('rehydrates after a successful mocked legacy migration', async () => {
    vi.mocked(migrateLegacyTrainingStateToBackend).mockResolvedValue({
      dataMode: 'supabase',
      profileMigrated: true,
      plansMigrated: 1,
      historyMigrated: 1,
      skipped: [],
    });
    vi.mocked(loadTrainingStateFromBackend).mockResolvedValue({
      dataMode: 'supabase',
      user: null,
      profile,
      plans: [plan],
      history: [],
      currentPlanId: undefined,
    });
    const onGoToDashboard = vi.fn();
    const { result } = renderHook(() => useTrainingSync({ onGoToDashboard }));

    await act(async () => {
      await result.current.migrateLegacyTrainingState();
    });

    expect(migrateLegacyTrainingStateToBackend).toHaveBeenCalledTimes(1);
    expect(loadTrainingStateFromBackend).toHaveBeenCalledTimes(1);
    expect(useAppStore.getState().currentPlanId).toBe('plan-1');
    expect(onGoToDashboard).toHaveBeenCalledTimes(1);
  });

  it('captures hydration errors without throwing to the caller', async () => {
    const error = new Error('backend unavailable');
    vi.mocked(loadTrainingStateFromBackend).mockRejectedValue(error);
    const { result } = renderHook(() => useTrainingSync({ onGoToDashboard: vi.fn() }));

    await act(async () => {
      await expect(result.current.hydrateTrainingState()).resolves.toBeUndefined();
    });

    expect(captureError).toHaveBeenCalledWith(error, 'App.hydrateTrainingStateFromBackend');
  });
});
