import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '../stores/useAppStore';
import type {
  Badge,
  DailyCheckin,
  StreakData,
  WorkoutHistoryEntry,
  WorkoutHistoryRecord,
  WorkoutPlan,
} from '../types';
import { useWorkoutManager } from './useWorkoutManager';

const mocks = vi.hoisted(() => ({
  calculateReadiness: vi.fn(),
  captureError: vi.fn(),
  enqueueOfflineAction: vi.fn(),
  evaluateAndUnlockBadges: vi.fn(),
  getTotalVolumeLifted: vi.fn(),
  loadHistory: vi.fn(),
  loadStreak: vi.fn(() => ({
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    totalWorkouts: 0,
    workoutDates: [],
  })),
  persistWorkoutHistoryToBackend: vi.fn(),
  recordGamificationEvent: vi.fn(),
  recordWorkoutForStreak: vi.fn(),
  recordWorkoutSession: vi.fn(),
  registerBackgroundSync: vi.fn(),
  saveDashboardSnapshot: vi.fn(),
  syncChallengeProgress: vi.fn(),
}));

vi.mock('../services/legacyTrainingSyncService', () => ({
  persistWorkoutHistoryToBackend: mocks.persistWorkoutHistoryToBackend,
}));

vi.mock('../services/gamificationService', () => ({
  recordGamificationEvent: mocks.recordGamificationEvent,
}));

vi.mock('../utils/offlineQueue', () => ({
  enqueueOfflineAction: mocks.enqueueOfflineAction,
}));

vi.mock('../utils/pwaUtils', () => ({
  registerBackgroundSync: mocks.registerBackgroundSync,
}));

vi.mock('../utils/errorTelemetry', () => ({
  captureError: mocks.captureError,
}));

vi.mock('../utils/readinessUtils', () => ({
  calculateReadiness: mocks.calculateReadiness,
}));

vi.mock('../utils/analyticsUtils', () => ({
  getTotalVolumeLifted: mocks.getTotalVolumeLifted,
  loadHistory: mocks.loadHistory,
  recordWorkoutSession: mocks.recordWorkoutSession,
}));

vi.mock('../utils/streakUtils', () => ({
  loadStreak: mocks.loadStreak,
  recordWorkoutForStreak: mocks.recordWorkoutForStreak,
}));

vi.mock('../utils/syncUtils', () => ({
  saveDashboardSnapshot: mocks.saveDashboardSnapshot,
}));

vi.mock('../utils/challengeUtils', () => ({
  syncChallengeProgress: mocks.syncChallengeProgress,
}));

vi.mock('../utils/badgeUtils', () => ({
  evaluateAndUnlockBadges: mocks.evaluateAndUnlockBadges,
}));

const initialAppStoreState = useAppStore.getState();

const checkin: DailyCheckin = {
  id: 'checkin-1',
  date: '2026-05-25',
  sleepHours: 8,
  sleepQuality: 4,
  stressLevel: 2,
  sorenessMap: {},
  energyLevel: 9,
  hydrationGlasses: 8,
  sleepGoalHours: 8,
  timestamp: 1779667200000,
};

const plan: WorkoutPlan = {
  id: 'plan-1',
  createdAt: 1779667200000,
  planName: 'Plano A',
  goalDescription: 'Forca',
  days: [{
    id: 'day-1',
    dayName: 'Upper',
    focus: 'Peito',
    exercises: [],
  }],
};

const record: WorkoutHistoryRecord = {
  id: 'record-1',
  date: Date.parse('2026-05-25T15:00:00.000Z'),
  planId: 'plan-1',
  dayId: 'day-1',
  dayName: 'Upper',
  focus: 'Peito',
  volumeLoad: 2400,
  durationMinutes: 55,
  exercises: [],
};

const analyticsEntry: WorkoutHistoryEntry = {
  id: 'entry-1',
  planId: 'plan-1',
  planName: 'Plano A',
  date: '2026-05-25',
  dayFocus: 'Peito',
  exerciseCount: 4,
  completedCount: 4,
  totalVolume: 2400,
  durationMinutes: 55,
  readinessScore: 88,
};

const currentStreak: StreakData = {
  currentStreak: 2,
  longestStreak: 4,
  lastWorkoutDate: '2026-05-24',
  totalWorkouts: 6,
  workoutDates: ['2026-05-23', '2026-05-24'],
};

const nextStreak: StreakData = {
  currentStreak: 3,
  longestStreak: 4,
  lastWorkoutDate: '2026-05-25',
  totalWorkouts: 7,
  workoutDates: ['2026-05-23', '2026-05-24', '2026-05-25'],
};

const newBadge: Badge = {
  id: 'badge-1',
  name: 'Consistente',
  description: 'Treinou bem',
  emoji: 'medal',
  unlocked: true,
  unlockedAt: 1779667200000,
  category: 'consistency',
};

type ShareEntry = (entry: WorkoutHistoryEntry) => void;
type ChallengeVersionChange = () => void;
type NewBadges = (badges: Badge[]) => void;

function setupWorkoutManager(options?: {
  allCheckins?: DailyCheckin[];
  onChallengeVersionChange?: ChallengeVersionChange;
  onNewBadges?: NewBadges;
  onShareEntry?: ShareEntry;
  todayCheckin?: DailyCheckin | null;
}) {
  const onShareEntry = options?.onShareEntry ?? vi.fn<ShareEntry>();
  const onChallengeVersionChange = options?.onChallengeVersionChange ?? vi.fn<ChallengeVersionChange>();
  const onNewBadges = options?.onNewBadges ?? vi.fn<NewBadges>();

  const hook = renderHook(() => useWorkoutManager({
    allCheckins: options?.allCheckins ?? [checkin],
    todayCheckin: options?.todayCheckin ?? checkin,
    onShareEntry,
    onChallengeVersionChange,
    onNewBadges,
  }));

  return {
    ...hook,
    onChallengeVersionChange,
    onNewBadges,
    onShareEntry,
  };
}

describe('useWorkoutManager', () => {
  beforeEach(() => {
    useAppStore.setState(initialAppStoreState, true);
    useAppStore.setState({
      user: { name: 'Ana', email: 'ana@example.com' },
      plans: [plan],
      workoutHistory: [],
      analyticsHistory: [],
      streakData: currentStreak,
    });
    localStorage.clear();
    vi.clearAllMocks();
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
    mocks.calculateReadiness.mockReturnValue({ score: 88 });
    mocks.getTotalVolumeLifted.mockReturnValue(2400);
    mocks.loadHistory.mockReturnValue([analyticsEntry]);
    mocks.persistWorkoutHistoryToBackend.mockResolvedValue(undefined);
    mocks.recordGamificationEvent.mockResolvedValue(undefined);
    mocks.recordWorkoutForStreak.mockReturnValue(nextStreak);
    mocks.recordWorkoutSession.mockReturnValue(analyticsEntry);
    mocks.evaluateAndUnlockBadges.mockReturnValue([newBadge]);
    mocks.enqueueOfflineAction.mockResolvedValue(undefined);
    mocks.registerBackgroundSync.mockResolvedValue(undefined);
  });

  afterEach(() => {
    useAppStore.setState(initialAppStoreState, true);
    localStorage.clear();
    vi.clearAllMocks();
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  it('completes a workout day and coordinates store updates, sharing, engagement and snapshot effects', async () => {
    const { result, onChallengeVersionChange, onNewBadges, onShareEntry } = setupWorkoutManager();

    act(() => {
      result.current.handleCompleteDay(record);
    });

    expect(useAppStore.getState().workoutHistory).toEqual([record]);
    expect(mocks.persistWorkoutHistoryToBackend).toHaveBeenCalledWith([record]);
    expect(mocks.recordGamificationEvent).toHaveBeenCalledWith('workout_completed', record.id);
    expect(mocks.calculateReadiness).toHaveBeenCalledWith(checkin);
    expect(mocks.recordWorkoutSession).toHaveBeenCalledWith(plan, 0, 55, 88);
    expect(mocks.loadHistory).toHaveBeenCalledTimes(1);
    expect(mocks.recordWorkoutForStreak).toHaveBeenCalledWith(currentStreak, '2026-05-25');
    expect(useAppStore.getState().analyticsHistory).toEqual([analyticsEntry]);
    expect(useAppStore.getState().streakData).toEqual(nextStreak);
    expect(onShareEntry).toHaveBeenCalledWith(analyticsEntry);
    expect(mocks.syncChallengeProgress).toHaveBeenCalledWith(1, 2400, 1);
    expect(onChallengeVersionChange).toHaveBeenCalledTimes(1);
    expect(mocks.evaluateAndUnlockBadges).toHaveBeenCalledWith(
      nextStreak,
      [analyticsEntry],
      1,
      0,
      0,
    );
    expect(onNewBadges).toHaveBeenCalledWith([newBadge]);
    expect(mocks.saveDashboardSnapshot).toHaveBeenCalledWith('ana@example.com', expect.objectContaining({
      plans: 1,
      workoutHistory: 1,
      totalVolume: 2400,
      currentStreak: 3,
      checkins: 1,
    }));

    await waitFor(() => {
      expect(mocks.persistWorkoutHistoryToBackend).toHaveBeenCalledTimes(1);
    });
  });

  it('queues an offline workout sync and registers background sync when the browser is offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    const { result } = setupWorkoutManager();

    act(() => {
      result.current.handleCompleteDay(record);
    });

    expect(mocks.enqueueOfflineAction).toHaveBeenCalledWith({
      type: 'WORKOUT_SESSION_COMPLETED',
      payload: record,
    });
    await waitFor(() => {
      expect(mocks.registerBackgroundSync).toHaveBeenCalledTimes(1);
    });
  });

  it('captures snapshot errors without interrupting the caller', () => {
    const snapshotError = new Error('storage unavailable');
    mocks.saveDashboardSnapshot.mockImplementation(() => {
      throw snapshotError;
    });
    const { result } = setupWorkoutManager();

    act(() => {
      expect(() => result.current.saveLocalDashboardSnapshot([analyticsEntry], nextStreak, [checkin])).not.toThrow();
    });

    expect(mocks.captureError).toHaveBeenCalledWith(snapshotError, 'App.saveLocalDashboardSnapshot');
  });
});
