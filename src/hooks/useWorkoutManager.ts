import { useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { type DailyCheckin, type WorkoutHistoryRecord, type WorkoutHistoryEntry } from '../types';
import { persistWorkoutHistoryToBackend } from '../services/legacyTrainingSyncService';
import { recordGamificationEvent } from '../services/gamificationService';
import { enqueueOfflineAction } from '../utils/offlineQueue';
import { registerBackgroundSync } from '../utils/pwaUtils';
import { captureError } from '../utils/errorTelemetry';
import { calculateReadiness } from '../utils/readinessUtils';
import { loadHistory, recordWorkoutSession, getTotalVolumeLifted } from '../utils/analyticsUtils';
import { recordWorkoutForStreak } from '../utils/streakUtils';
import { saveDashboardSnapshot } from '../utils/syncUtils';
import { syncChallengeProgress } from '../utils/challengeUtils';
import { evaluateAndUnlockBadges } from '../utils/badgeUtils';

interface UseWorkoutManagerOptions {
  allCheckins: DailyCheckin[];
  todayCheckin: DailyCheckin | null;
  onShareEntry: (entry: WorkoutHistoryEntry) => void;
  onChallengeVersionChange: () => void;
  onNewBadges: (badges: any[]) => void;
}

const getStoredArrayCount = (key: string) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
};

const getNutritionMealCount = () => Math.max(
  getStoredArrayCount('@TreinoApp:meals:mock_dev_only'),
  getStoredArrayCount('@TreinoApp:meals')
);

export function useWorkoutManager({
  allCheckins,
  todayCheckin,
  onShareEntry,
  onChallengeVersionChange,
  onNewBadges
}: UseWorkoutManagerOptions) {
  const {
    user,
    plans,
    workoutHistory,
    setWorkoutHistory,
    streakData,
    setStreakData,
    analyticsHistory,
    setAnalyticsHistory
  } = useAppStore();

  const refreshEngagement = useCallback((
    nextStreak = streakData,
    nextHistory = analyticsHistory,
    nextCheckins = allCheckins
  ) => {
    syncChallengeProgress(
      nextHistory.length,
      getTotalVolumeLifted(nextHistory),
      nextCheckins.length
    );
    onChallengeVersionChange();

    const newly = evaluateAndUnlockBadges(
      nextStreak,
      nextHistory,
      nextCheckins.length,
      getStoredArrayCount('@TreinoApp:prs'),
      getNutritionMealCount()
    );
    if (newly.length) onNewBadges(newly);
  }, [streakData, analyticsHistory, allCheckins, onChallengeVersionChange, onNewBadges]);

  const saveLocalDashboardSnapshot = useCallback((
    nextHistory = analyticsHistory,
    nextStreak = streakData,
    nextCheckins = allCheckins
  ) => {
    try {
      saveDashboardSnapshot(user?.email || user?.name || 'local-user', {
        plans: plans.length,
        workoutHistory: nextHistory.length,
        totalVolume: getTotalVolumeLifted(nextHistory),
        currentStreak: nextStreak.currentStreak,
        checkins: nextCheckins.length,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      captureError(error, 'App.saveLocalDashboardSnapshot');
    }
  }, [analyticsHistory, streakData, allCheckins, user, plans.length]);

  const enqueueWorkoutSync = useCallback((record: WorkoutHistoryRecord) => {
    if (!navigator.onLine) {
      void enqueueOfflineAction({
        type: 'WORKOUT_SESSION_COMPLETED',
        payload: record,
      })
        .then(() => registerBackgroundSync())
        .catch(error => captureError(error, 'App.enqueueWorkoutOffline'));
    }
  }, []);

  const handleCompleteDay = useCallback((record: WorkoutHistoryRecord) => {
    const newHistory = [...workoutHistory, record];
    setWorkoutHistory(newHistory);
    void persistWorkoutHistoryToBackend(newHistory)
      .catch(error => captureError(error, 'App.persistWorkoutHistory'));
    enqueueWorkoutSync(record);
    void recordGamificationEvent('workout_completed', record.id)
      .catch(error => captureError(error, 'App.workoutCompletedGamification'));

    const completedPlan = plans.find(plan => plan.id === record.planId);
    const completedDayIndex = completedPlan?.days.findIndex(day => day.id === record.dayId) ?? -1;
    if (completedPlan && completedDayIndex >= 0) {
      const completedEntry = recordWorkoutSession(
        completedPlan,
        completedDayIndex,
        record.durationMinutes,
        todayCheckin ? calculateReadiness(todayCheckin).score : undefined
      );
      const nextAnalyticsHistory = loadHistory();
      const nextStreak = recordWorkoutForStreak(streakData, new Date(record.date).toISOString().slice(0, 10));
      setAnalyticsHistory(nextAnalyticsHistory);
      setStreakData(nextStreak);
      onShareEntry(completedEntry);
      refreshEngagement(nextStreak, nextAnalyticsHistory, allCheckins);
      saveLocalDashboardSnapshot(nextAnalyticsHistory, nextStreak, allCheckins);
    }
  }, [
    workoutHistory, setWorkoutHistory, enqueueWorkoutSync, plans, 
    todayCheckin, streakData, setAnalyticsHistory, setStreakData, 
    onShareEntry, refreshEngagement, saveLocalDashboardSnapshot, allCheckins
  ]);

  return {
    handleCompleteDay,
    refreshEngagement,
    saveLocalDashboardSnapshot
  };
}
