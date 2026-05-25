import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordGamificationEvent } from '../services/gamificationService';
import { persistWorkoutHistoryToBackend } from '../services/legacyTrainingSyncService';
import { useAppStore } from '../stores/useAppStore';
import type {
  DailyCheckin,
  StreakData,
  User,
  WorkoutHistoryEntry,
  WorkoutHistoryRecord,
  WorkoutPlan,
} from '../types';
import { evaluateAndUnlockBadges } from '../utils/badgeUtils';
import { syncChallengeProgress } from '../utils/challengeUtils';
import { captureError } from '../utils/errorTelemetry';
import { loadHistory, recordWorkoutSession, getTotalVolumeLifted } from '../utils/analyticsUtils';
import { enqueueOfflineAction } from '../utils/offlineQueue';
import { registerBackgroundSync } from '../utils/pwaUtils';
import { calculateReadiness } from '../utils/readinessUtils';
import { saveDashboardSnapshot } from '../utils/syncUtils';
import { recordWorkoutForStreak } from '../utils/streakUtils';
import { useWorkoutManager } from './useWorkoutManager';

vi.mock('../services/legacyTrainingSyncService', () => ({
  persistWorkoutHistoryToBackend: vi.fn(),
}));

vi.mock('../services/gamificationService', () => ({
  recordGamificationEvent: vi.fn(),
}));

vi.mock('../utils/offlineQueue', () => ({
  enqueueOfflineAction: vi.fn(),
}));

vi.mock('../utils/pwaUtils', () => ({
  registerBackgroundSync: vi.fn(),
}));

vi.mock('../utils/errorTelemetry', () => ({
  captureError: vi.fn(),
}));

vi.mock('../utils/readinessUtils', () => ({
  calculateReadiness: vi.fn(),
}));

vi.mock('../utils/analyticsUtils', () => ({
  loadHistory: vi.fn(() => []),
  recordWorkoutSession: vi.fn(),
  getTotalVolumeLifted: vi.fn(),
}));

vi.mock('../utils/streakUtils', () => ({
  loadStreak: vi.fn(() => ({
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    totalWorkouts: 0,
    workoutDates: [],
  })),
  recordWorkoutForStreak: vi.fn(),
}));

vi.mock('../utils/syncUtils', () => ({
  saveDashboardSnapshot: vi.fn(),
}));

vi.mock('../utils/challengeUtils', () => ({
  syncChallengeProgress: vi.fn(),
}));

vi.mock('../utils/badgeUtils', () => ({
  evaluateAndUnlockBadges: vi.fn(),
}));

const initialAppStoreState = useAppStore.getState();

const user: User = {
  name: 'Ana',
  email: 'ana@example.test',
  avatarUrl: 'https://example.test/avatar.png',
};

const streakData: StreakData = {
  currentStreak: 3,
  longestStreak: 4,
  lastWorkoutDate: '2026-05-24',
  totalWorkouts: 8,
  workoutDates: ['2026-05-23', '2026-05-24'],
};

const nextStreak: StreakData = {
  currentStreak: 4,
  longestStreak: 4,
  lastWorkoutDate: '2026-05-25',
  totalWorkouts: 9,
  workoutDates: ['2026-05-23', '2026-05-24', '2026-05-25'],
};

const dailyCheckin: DailyCheckin = {
  id: 'checkin-1',
  date: '2026-05-25',
  sleepHours: 7,
  sleepQuality: 4,
  stressLevel: 2,
  sorenessMap: { Peito: 1 },
  energyLevel: 8,
  hydrationGlasses: 8,
  sleepGoalHours: 8,
  timestamp: 1779667200000,
};

const plan: WorkoutPlan = {
  id: 'plan-1',
  createdAt: 1779660000000,
  planName: 'Forca A',
  goalDescription: 'Forca',
  days: [
    {
      id: 'day-1',
      dayName: 'Upper',
      focus: 'Peito',
      exercises: [
        {
          id: 'exercise-1',
          name: 'Supino',
          sets: 3,
          reps: '8',
          rest: '90s',
        },
      ],
    },
  ],
};

const workoutRecord: WorkoutHistoryRecord = {
  id: 'record-1',
  date: 1779667200000,
  planId: 'plan-1',
  dayId: 'day-1',
  dayName: 'Upper',
  focus: 'Peito',
  volumeLoad: 1800,
  durationMinutes: 42,
  exercises: plan.days[0].exercises,
};

const analyticsEntry: WorkoutHistoryEntry = {
  id: 'analytics-1',
  planId: 'plan-1',
  planName: 'Forca A',
  date: '2026-05-25',
  dayFocus: 'Peito',
  exerciseCount: 1,
  completedCount: 1,
  totalVolume: 1800,
  durationMinutes: 42,
  readinessScore: 82,
};

function setNavigatorOnline(online: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: online,
  });
}

function renderManager(options: Partial<Parameters<typeof useWorkoutManager>[0]> = {}) {
  const onShareEntry = vi.fn();
  const onChallengeVersionChange = vi.fn();
  const onNewBadges = vi.fn();

  const hook = renderHook(() =>
    useWorkoutManager({
      allCheckins: [dailyCheckin],
      todayCheckin: dailyCheckin,
      onShareEntry,
      onChallengeVersionChange,
      onNewBadges,
      ...options,
    }),
  );

  return {
    ...hook,
    onShareEntry,
    onChallengeVersionChange,
    onNewBadges,
  };
}

describe('useWorkoutManager', () => {
  beforeEach(() => {
    useAppStore.setState(initialAppStoreState, true);
    useAppStore.setState({
      user,
      plans: [plan],
      workoutHistory: [],
      analyticsHistory: [],
      streakData,
    });
    localStorage.clear();
    setNavigatorOnline(true);
    vi.clearAllMocks();

    vi.mocked(persistWorkoutHistoryToBackend).mockResolvedValue({
      dataMode: 'mock_dev_only',
      warning: 'mocked persistence',
      historyMigrated: 1,
      skipped: [],
    });
    vi.mocked(recordGamificationEvent).mockResolvedValue({ skipped: true, reason: 'mocked test event' });
    vi.mocked(enqueueOfflineAction).mockResolvedValue({
      id: 'offline-1',
      type: 'WORKOUT_SESSION_COMPLETED',
      payload: workoutRecord,
      status: 'pending',
      attempts: 0,
      createdAt: 1779667200000,
      updatedAt: 1779667200000,
    });
    vi.mocked(registerBackgroundSync).mockResolvedValue(true);
    vi.mocked(calculateReadiness).mockReturnValue({
      score: 82,
      label: 'Boa',
      color: '#22c55e',
      recommendation: 'Treino moderado',
      adjustedIntensity: 0.9,
    });
    vi.mocked(recordWorkoutSession).mockReturnValue(analyticsEntry);
    vi.mocked(loadHistory).mockReturnValue([analyticsEntry]);
    vi.mocked(getTotalVolumeLifted).mockReturnValue(1800);
    vi.mocked(recordWorkoutForStreak).mockReturnValue(nextStreak);
    vi.mocked(evaluateAndUnlockBadges).mockReturnValue([]);
  });

  it('completes a workout day and updates store, analytics, streak, sharing and snapshot side effects', () => {
    const { result, onShareEntry, onChallengeVersionChange, onNewBadges } = renderManager();

    act(() => {
      result.current.handleCompleteDay(workoutRecord);
    });

    expect(useAppStore.getState().workoutHistory).toEqual([workoutRecord]);
    expect(persistWorkoutHistoryToBackend).toHaveBeenCalledWith([workoutRecord]);
    expect(recordGamificationEvent).toHaveBeenCalledWith('workout_completed', workoutRecord.id);
    expect(calculateReadiness).toHaveBeenCalledWith(dailyCheckin);
    expect(recordWorkoutSession).toHaveBeenCalledWith(plan, 0, workoutRecord.durationMinutes, 82);
    expect(loadHistory).toHaveBeenCalledTimes(1);
    expect(recordWorkoutForStreak).toHaveBeenCalledWith(streakData, '2026-05-25');
    expect(useAppStore.getState().analyticsHistory).toEqual([analyticsEntry]);
    expect(useAppStore.getState().streakData).toEqual(nextStreak);
    expect(onShareEntry).toHaveBeenCalledWith(analyticsEntry);
    expect(syncChallengeProgress).toHaveBeenCalledWith(1, 1800, 1);
    expect(onChallengeVersionChange).toHaveBeenCalledTimes(1);
    expect(onNewBadges).not.toHaveBeenCalled();
    expect(saveDashboardSnapshot).toHaveBeenCalledWith(
      user.email,
      expect.objectContaining({
        plans: 1,
        workoutHistory: 1,
        totalVolume: 1800,
        currentStreak: nextStreak.currentStreak,
        checkins: 1,
      }),
    );
  });

  it('queues a completed workout for offline sync and registers background sync when offline', async () => {
    setNavigatorOnline(false);
    const { result } = renderManager();

    act(() => {
      result.current.handleCompleteDay(workoutRecord);
    });

    await waitFor(() => expect(enqueueOfflineAction).toHaveBeenCalledTimes(1));
    expect(enqueueOfflineAction).toHaveBeenCalledWith({
      type: 'WORKOUT_SESSION_COMPLETED',
      payload: workoutRecord,
    });
    await waitFor(() => expect(registerBackgroundSync).toHaveBeenCalledTimes(1));
  });

  it('refreshes engagement with mocked totals and reports newly unlocked badges', () => {
    const badge = {
      id: 'badge-1',
      name: 'Consistencia',
      description: 'Treinos consistentes',
      emoji: '*',
      unlockedAt: 1779667200000,
      unlocked: true,
      category: 'consistency' as const,
    };
    vi.mocked(evaluateAndUnlockBadges).mockReturnValue([badge]);
    const { result, onChallengeVersionChange, onNewBadges } = renderManager();

    act(() => {
      result.current.refreshEngagement(nextStreak, [analyticsEntry], [dailyCheckin]);
    });

    expect(syncChallengeProgress).toHaveBeenCalledWith(1, 1800, 1);
    expect(evaluateAndUnlockBadges).toHaveBeenCalledWith(nextStreak, [analyticsEntry], 1, 0, 0);
    expect(onChallengeVersionChange).toHaveBeenCalledTimes(1);
    expect(onNewBadges).toHaveBeenCalledWith([badge]);
  });

  it('captures dashboard snapshot failures without interrupting the hook caller', () => {
    const snapshotError = new Error('storage unavailable');
    vi.mocked(saveDashboardSnapshot).mockImplementation(() => {
      throw snapshotError;
    });
    const { result } = renderManager();

    act(() => {
      result.current.saveLocalDashboardSnapshot([analyticsEntry], nextStreak, [dailyCheckin]);
    });

    expect(captureError).toHaveBeenCalledWith(snapshotError, 'App.saveLocalDashboardSnapshot');
  });
});
