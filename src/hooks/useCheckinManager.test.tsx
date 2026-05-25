import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordGamificationEvent } from '../services/gamificationService';
import { getTodayCheckinFromList } from '../services/healthService';
import { useAppStore } from '../stores/useAppStore';
import type { DailyCheckin, RecoveryCheckin, StreakData, WorkoutHistoryEntry } from '../types';
import type { DataMode } from '../types/trainingExecution';
import { captureError } from '../utils/errorTelemetry';
import type { DailyCheckinsQueryResult } from './useDailyCheckinsQuery';
import { useDailyCheckinsQuery } from './useDailyCheckinsQuery';
import { useSaveDailyCheckinMutation } from './useSaveDailyCheckinMutation';
import { useCheckinManager } from './useCheckinManager';

vi.mock('./useDailyCheckinsQuery', () => ({
  useDailyCheckinsQuery: vi.fn(),
}));

vi.mock('./useSaveDailyCheckinMutation', () => ({
  useSaveDailyCheckinMutation: vi.fn(),
}));

vi.mock('../services/healthService', () => ({
  getTodayCheckinFromList: vi.fn(),
}));

vi.mock('../services/gamificationService', () => ({
  recordGamificationEvent: vi.fn(),
}));

vi.mock('../utils/errorTelemetry', () => ({
  captureError: vi.fn(),
}));

type SaveDailyCheckinResult = {
  data: DailyCheckin;
  dataMode: DataMode;
  warning?: string;
};

type MockDailyCheckinsQuery = {
  data?: DailyCheckinsQueryResult;
  error?: unknown;
  refetch: ReturnType<typeof vi.fn>;
};

type MockSaveDailyCheckinMutation = {
  mutateAsync: ReturnType<typeof vi.fn>;
};

const initialAppStoreState = useAppStore.getState();

const streakData: StreakData = {
  currentStreak: 2,
  longestStreak: 5,
  lastWorkoutDate: '2026-05-24',
  totalWorkouts: 9,
  workoutDates: ['2026-05-23', '2026-05-24'],
};

const analyticsEntry: WorkoutHistoryEntry = {
  id: 'analytics-1',
  planId: 'plan-1',
  planName: 'Forca A',
  date: '2026-05-24',
  dayFocus: 'Upper',
  exerciseCount: 4,
  completedCount: 4,
  totalVolume: 2400,
  durationMinutes: 45,
};

const dailyCheckin: DailyCheckin = {
  id: 'checkin-1',
  date: '2026-05-25',
  sleepHours: 7.5,
  sleepQuality: 4,
  stressLevel: 3,
  sorenessMap: { Pernas: 2 },
  energyLevel: 8,
  hydrationGlasses: 9,
  sleepGoalHours: 8,
  notes: 'Treino leve',
  timestamp: 1779667200000,
};

const secondCheckin: DailyCheckin = {
  ...dailyCheckin,
  id: 'checkin-2',
  date: '2026-05-24',
  energyLevel: 6,
};

const queryResult = (
  data: DailyCheckin[],
  options: { dataMode?: DataMode; warning?: string } = {},
): DailyCheckinsQueryResult => ({
  data,
  dataMode: options.dataMode ?? 'mock_dev_only',
  warning: options.warning,
});

function createQueryMock(overrides: Partial<MockDailyCheckinsQuery> = {}): MockDailyCheckinsQuery {
  return {
    data: undefined,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

function createMutationMock(): MockSaveDailyCheckinMutation {
  return {
    mutateAsync: vi.fn(),
  };
}

function renderManager(options: Partial<Parameters<typeof useCheckinManager>[0]> = {}) {
  const setAllCheckins = vi.fn();
  const onEngagementRefresh = vi.fn();
  const onSnapshotSave = vi.fn();
  const allCheckins = options.allCheckins ?? [secondCheckin];

  const hook = renderHook(() =>
    useCheckinManager({
      allCheckins,
      setAllCheckins,
      onEngagementRefresh,
      onSnapshotSave,
      ...options,
    }),
  );

  return {
    ...hook,
    allCheckins,
    setAllCheckins,
    onEngagementRefresh,
    onSnapshotSave,
  };
}

describe('useCheckinManager', () => {
  let dailyCheckinsQuery: MockDailyCheckinsQuery;
  let saveDailyCheckinMutation: MockSaveDailyCheckinMutation;

  beforeEach(() => {
    useAppStore.setState(initialAppStoreState, true);
    useAppStore.setState({
      analyticsHistory: [analyticsEntry],
      streakData,
      todayCheckin: null,
      recoveryCheckin: null,
    });
    localStorage.clear();
    vi.clearAllMocks();

    dailyCheckinsQuery = createQueryMock();
    saveDailyCheckinMutation = createMutationMock();
    vi.mocked(useDailyCheckinsQuery).mockReturnValue(dailyCheckinsQuery as never);
    vi.mocked(useSaveDailyCheckinMutation).mockReturnValue(saveDailyCheckinMutation as never);
    vi.mocked(getTodayCheckinFromList).mockReturnValue(dailyCheckin);
    vi.mocked(recordGamificationEvent).mockResolvedValue({ skipped: true, reason: 'mocked test event' });
  });

  it('applies mocked query data to local state and the app store on mount', async () => {
    const initialResult = queryResult([dailyCheckin, secondCheckin], {
      warning: 'mocked health storage',
    });
    dailyCheckinsQuery.data = initialResult;

    const { result, setAllCheckins } = renderManager();

    await waitFor(() => expect(setAllCheckins).toHaveBeenCalledWith(initialResult.data));

    expect(getTodayCheckinFromList).toHaveBeenCalledWith(initialResult.data);
    expect(useAppStore.getState().todayCheckin).toEqual(dailyCheckin);
    expect(result.current.healthDataMode).toBe('mock_dev_only');
    expect(result.current.healthWarning).toBe('mocked health storage');
    expect(result.current.checkinError).toBeNull();
  });

  it('refreshes daily checkins from a mocked refetch result', async () => {
    const refreshedResult = queryResult([dailyCheckin], { dataMode: 'supabase' });
    dailyCheckinsQuery.refetch.mockResolvedValue({
      data: refreshedResult,
      error: null,
    });

    const { result, setAllCheckins } = renderManager();

    let refreshed: DailyCheckin[] | undefined;
    await act(async () => {
      refreshed = await result.current.refreshDailyCheckins();
    });

    expect(refreshed).toEqual([dailyCheckin]);
    expect(dailyCheckinsQuery.refetch).toHaveBeenCalledTimes(1);
    expect(setAllCheckins).toHaveBeenCalledWith([dailyCheckin]);
    expect(result.current.healthDataMode).toBe('supabase');
    expect(result.current.checkinError).toBeNull();
  });

  it('saves a daily checkin, refreshes engagement and records the gamification side effect', async () => {
    const refreshedResult = queryResult([dailyCheckin, secondCheckin], {
      warning: 'synced from mock',
    });
    const savedResult: SaveDailyCheckinResult = {
      data: dailyCheckin,
      dataMode: 'mock_dev_only',
      warning: 'synced from mock',
    };
    saveDailyCheckinMutation.mutateAsync.mockResolvedValue(savedResult);
    dailyCheckinsQuery.refetch.mockResolvedValue({
      data: refreshedResult,
      error: null,
    });

    const { result, onEngagementRefresh, onSnapshotSave } = renderManager();

    await act(async () => {
      await result.current.handleSaveCheckin(dailyCheckin);
    });

    expect(saveDailyCheckinMutation.mutateAsync).toHaveBeenCalledWith(dailyCheckin);
    expect(dailyCheckinsQuery.refetch).toHaveBeenCalledTimes(1);
    expect(useAppStore.getState().todayCheckin).toEqual(dailyCheckin);
    expect(onEngagementRefresh).toHaveBeenCalledWith(streakData, [analyticsEntry], refreshedResult.data);
    expect(onSnapshotSave).toHaveBeenCalledWith([analyticsEntry], streakData, refreshedResult.data);
    expect(recordGamificationEvent).toHaveBeenCalledWith('checkin');
    expect(result.current.checkinSaving).toBe(false);
    expect(result.current.healthWarning).toBe('synced from mock');
  });

  it('normalizes save errors, exposes the message and captures telemetry', async () => {
    const error = new Error('save failed');
    saveDailyCheckinMutation.mutateAsync.mockRejectedValue(error);

    const { result, onEngagementRefresh, onSnapshotSave } = renderManager();

    await act(async () => {
      await expect(result.current.handleSaveCheckin(dailyCheckin)).rejects.toThrow('save failed');
    });

    expect(result.current.checkinSaving).toBe(false);
    expect(result.current.checkinError).toBe('save failed');
    expect(onEngagementRefresh).not.toHaveBeenCalled();
    expect(onSnapshotSave).not.toHaveBeenCalled();
    expect(captureError).toHaveBeenCalledWith(error, 'App.saveDailyCheckin');
  });

  it('converts a recovery checkin into a daily checkin and refreshes after the mocked save', async () => {
    const recoveryCheckin: RecoveryCheckin = {
      sleepHours: 6.5,
      stressLevel: 4,
      sorenessLevel: 5,
      energyLevel: 6,
      timestamp: 1779667200000,
    };
    const refreshedResult = queryResult([dailyCheckin]);
    saveDailyCheckinMutation.mutateAsync.mockResolvedValue({
      data: dailyCheckin,
      dataMode: 'mock_dev_only',
    } satisfies SaveDailyCheckinResult);
    dailyCheckinsQuery.refetch.mockResolvedValue({
      data: refreshedResult,
      error: null,
    });
    useAppStore.setState({ todayCheckin: dailyCheckin });

    const { result } = renderManager();

    act(() => {
      result.current.handleSaveRecoveryCheckin(recoveryCheckin);
    });

    expect(useAppStore.getState().recoveryCheckin).toEqual(recoveryCheckin);
    await waitFor(() => expect(saveDailyCheckinMutation.mutateAsync).toHaveBeenCalledTimes(1));

    const payload = saveDailyCheckinMutation.mutateAsync.mock.calls[0]?.[0] as DailyCheckin;
    expect(payload).toMatchObject({
      id: dailyCheckin.id,
      sleepHours: recoveryCheckin.sleepHours,
      sleepQuality: dailyCheckin.sleepQuality,
      stressLevel: recoveryCheckin.stressLevel,
      energyLevel: recoveryCheckin.energyLevel,
      hydrationGlasses: dailyCheckin.hydrationGlasses,
      sleepGoalHours: dailyCheckin.sleepGoalHours,
      sorenessMap: {
        ...dailyCheckin.sorenessMap,
        Geral: recoveryCheckin.sorenessLevel,
      },
    });
    expect(payload.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await waitFor(() => expect(dailyCheckinsQuery.refetch).toHaveBeenCalledTimes(1));
    expect(result.current.checkinError).toBeNull();
  });
});
