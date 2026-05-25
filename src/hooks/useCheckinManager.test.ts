import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '../stores/useAppStore';
import type { DailyCheckin, RecoveryCheckin, StreakData, WorkoutHistoryEntry } from '../types';
import { useCheckinManager } from './useCheckinManager';

const mocks = vi.hoisted(() => ({
  captureError: vi.fn(),
  getTodayCheckinFromList: vi.fn(),
  recordGamificationEvent: vi.fn(),
  useDailyCheckinsQuery: vi.fn(),
  useSaveDailyCheckinMutation: vi.fn(),
}));

vi.mock('../utils/errorTelemetry', () => ({
  captureError: mocks.captureError,
}));

vi.mock('../services/gamificationService', () => ({
  recordGamificationEvent: mocks.recordGamificationEvent,
}));

vi.mock('../services/healthService', () => ({
  getTodayCheckinFromList: mocks.getTodayCheckinFromList,
}));

vi.mock('./useDailyCheckinsQuery', () => ({
  useDailyCheckinsQuery: mocks.useDailyCheckinsQuery,
}));

vi.mock('./useSaveDailyCheckinMutation', () => ({
  useSaveDailyCheckinMutation: mocks.useSaveDailyCheckinMutation,
}));

const initialAppStoreState = useAppStore.getState();

const checkin: DailyCheckin = {
  id: 'checkin-1',
  date: '2026-05-25',
  sleepHours: 7.5,
  sleepQuality: 4,
  stressLevel: 3,
  sorenessMap: { Pernas: 2 },
  energyLevel: 8,
  hydrationGlasses: 9,
  sleepGoalHours: 8,
  notes: 'Recuperado',
  timestamp: 1779667200000,
};

const updatedCheckin: DailyCheckin = {
  ...checkin,
  id: 'checkin-2',
  hydrationGlasses: 10,
  notes: 'Atualizado',
};

const streakData: StreakData = {
  currentStreak: 3,
  longestStreak: 5,
  lastWorkoutDate: '2026-05-24',
  totalWorkouts: 8,
  workoutDates: ['2026-05-22', '2026-05-24'],
};

const analyticsHistory: WorkoutHistoryEntry[] = [{
  id: 'entry-1',
  planId: 'plan-1',
  planName: 'Plano A',
  date: '2026-05-24',
  dayFocus: 'Upper',
  exerciseCount: 4,
  completedCount: 4,
  totalVolume: 2200,
  durationMinutes: 50,
}];

type SetAllCheckins = (checkins: DailyCheckin[]) => void;
type EngagementRefresh = (
  streak?: StreakData,
  history?: WorkoutHistoryEntry[],
  checkins?: DailyCheckin[],
) => void;
type SnapshotSave = (
  history?: WorkoutHistoryEntry[],
  streak?: StreakData,
  checkins?: DailyCheckin[],
) => void;

function setupCheckinManager(options?: {
  allCheckins?: DailyCheckin[];
  onEngagementRefresh?: EngagementRefresh;
  onSnapshotSave?: SnapshotSave;
  setAllCheckins?: SetAllCheckins;
}) {
  const setAllCheckins = options?.setAllCheckins ?? vi.fn<SetAllCheckins>();
  const onEngagementRefresh = options?.onEngagementRefresh ?? vi.fn<EngagementRefresh>();
  const onSnapshotSave = options?.onSnapshotSave ?? vi.fn<SnapshotSave>();

  const hook = renderHook(() => useCheckinManager({
    allCheckins: options?.allCheckins ?? [],
    setAllCheckins,
    onEngagementRefresh,
    onSnapshotSave,
  }));

  return {
    ...hook,
    setAllCheckins,
    onEngagementRefresh,
    onSnapshotSave,
  };
}

describe('useCheckinManager', () => {
  beforeEach(() => {
    useAppStore.setState(initialAppStoreState, true);
    useAppStore.setState({ streakData, analyticsHistory });
    localStorage.clear();
    vi.clearAllMocks();
    mocks.getTodayCheckinFromList.mockReturnValue(checkin);
    mocks.recordGamificationEvent.mockResolvedValue(undefined);
    mocks.useDailyCheckinsQuery.mockReturnValue({
      data: undefined,
      error: null,
      refetch: vi.fn(),
    });
    mocks.useSaveDailyCheckinMutation.mockReturnValue({
      mutateAsync: vi.fn(),
    });
  });

  afterEach(() => {
    useAppStore.setState(initialAppStoreState, true);
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('applies daily checkins from the mocked query into local state and the app store', async () => {
    const queryResult = {
      data: [checkin],
      dataMode: 'mock_dev_only' as const,
      warning: 'mocked health storage',
    };
    mocks.useDailyCheckinsQuery.mockReturnValue({
      data: queryResult,
      error: null,
      refetch: vi.fn(),
    });

    const { result, setAllCheckins } = setupCheckinManager();

    await waitFor(() => {
      expect(setAllCheckins).toHaveBeenCalledWith([checkin]);
    });

    expect(mocks.getTodayCheckinFromList).toHaveBeenCalledWith([checkin]);
    expect(useAppStore.getState().todayCheckin).toEqual(checkin);
    expect(result.current.healthDataMode).toBe('mock_dev_only');
    expect(result.current.healthWarning).toBe('mocked health storage');
    expect(result.current.checkinError).toBeNull();
  });

  it('saves a daily checkin, refreshes query data and triggers engagement side effects', async () => {
    const refetch = vi.fn().mockResolvedValue({
      data: {
        data: [updatedCheckin],
        dataMode: 'supabase' as const,
      },
      error: null,
    });
    const mutateAsync = vi.fn().mockResolvedValue({
      data: updatedCheckin,
      dataMode: 'supabase' as const,
      warning: 'saved remotely',
    });
    mocks.useDailyCheckinsQuery.mockReturnValue({
      data: undefined,
      error: null,
      refetch,
    });
    mocks.useSaveDailyCheckinMutation.mockReturnValue({ mutateAsync });
    mocks.getTodayCheckinFromList.mockReturnValue(updatedCheckin);

    const { result, setAllCheckins, onEngagementRefresh, onSnapshotSave } = setupCheckinManager({
      allCheckins: [checkin],
    });

    await act(async () => {
      await result.current.handleSaveCheckin(updatedCheckin);
    });

    expect(mutateAsync).toHaveBeenCalledWith(updatedCheckin);
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(setAllCheckins).toHaveBeenCalledWith([updatedCheckin]);
    expect(useAppStore.getState().todayCheckin).toEqual(updatedCheckin);
    expect(result.current.healthDataMode).toBe('supabase');
    expect(result.current.healthWarning).toBeNull();
    expect(result.current.checkinSaving).toBe(false);
    expect(result.current.checkinError).toBeNull();
    expect(onEngagementRefresh).toHaveBeenCalledWith(streakData, analyticsHistory, [updatedCheckin]);
    expect(mocks.recordGamificationEvent).toHaveBeenCalledWith('checkin');
    expect(onSnapshotSave).toHaveBeenCalledWith(analyticsHistory, streakData, [updatedCheckin]);
  });

  it('normalizes save errors, stores the message and captures telemetry', async () => {
    const failure = new Error('save failed');
    const mutateAsync = vi.fn().mockRejectedValue(failure);
    mocks.useSaveDailyCheckinMutation.mockReturnValue({ mutateAsync });

    const { result } = setupCheckinManager({ allCheckins: [checkin] });

    await act(async () => {
      await expect(result.current.handleSaveCheckin(checkin)).rejects.toThrow('save failed');
    });

    expect(result.current.checkinSaving).toBe(false);
    expect(result.current.checkinError).toBe('save failed');
    expect(mocks.captureError).toHaveBeenCalledWith(failure, 'App.saveDailyCheckin');
  });

  it('maps a recovery checkin to a daily checkin before saving it', async () => {
    useAppStore.setState({ todayCheckin: checkin });
    const mutateAsync = vi.fn().mockResolvedValue({
      data: updatedCheckin,
      dataMode: 'mock_dev_only' as const,
    });
    const refetch = vi.fn().mockResolvedValue({
      data: {
        data: [updatedCheckin],
        dataMode: 'mock_dev_only' as const,
      },
      error: null,
    });
    mocks.useSaveDailyCheckinMutation.mockReturnValue({ mutateAsync });
    mocks.useDailyCheckinsQuery.mockReturnValue({
      data: undefined,
      error: null,
      refetch,
    });

    const recoveryCheckin: RecoveryCheckin = {
      sleepHours: 6.5,
      stressLevel: 4,
      sorenessLevel: 5,
      energyLevel: 6,
      timestamp: 1779667200000,
    };
    const expectedDate = new Date().toISOString().slice(0, 10);

    const { result } = setupCheckinManager({ allCheckins: [checkin] });

    act(() => {
      result.current.handleSaveRecoveryCheckin(recoveryCheckin);
    });

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(mutateAsync.mock.calls[0]?.[0]).toMatchObject({
      id: checkin.id,
      date: expectedDate,
      sleepHours: 6.5,
      sleepQuality: 4,
      stressLevel: 4,
      sorenessMap: { Pernas: 2, Geral: 5 },
      energyLevel: 6,
      hydrationGlasses: 9,
      sleepGoalHours: 8,
      notes: 'Recuperado',
    });
    expect(useAppStore.getState().recoveryCheckin).toEqual(recoveryCheckin);
  });
});
