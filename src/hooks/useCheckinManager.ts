import { useCallback, useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { type DailyCheckin, type RecoveryCheckin, type StreakData, type WorkoutHistoryEntry } from '../types';
import { type DailyCheckinsQueryResult, useDailyCheckinsQuery } from './useDailyCheckinsQuery';
import { useSaveDailyCheckinMutation } from './useSaveDailyCheckinMutation';
import { getErrorMessage, toError } from '../utils/errors';
import { captureError } from '../utils/errorTelemetry';
import { getTodayCheckinFromList } from '../services/healthService';
import { recordGamificationEvent } from '../services/gamificationService';
import type { DataMode } from '../types/trainingExecution';

interface UseCheckinManagerOptions {
  allCheckins: DailyCheckin[];
  setAllCheckins: (checkins: DailyCheckin[]) => void;
  onEngagementRefresh: (streak?: StreakData, history?: WorkoutHistoryEntry[], checkins?: DailyCheckin[]) => void;
  onSnapshotSave: (history?: WorkoutHistoryEntry[], streak?: StreakData, checkins?: DailyCheckin[]) => void;
}

export function useCheckinManager({
  allCheckins,
  setAllCheckins,
  onEngagementRefresh,
  onSnapshotSave,
}: UseCheckinManagerOptions) {
  const { 
    setTodayCheckin, 
    setRecoveryCheckin,
    todayCheckin,
    streakData,
    analyticsHistory
  } = useAppStore();

  const dailyCheckinsQuery = useDailyCheckinsQuery();
  const saveDailyCheckinMutation = useSaveDailyCheckinMutation();

  const [healthDataMode, setHealthDataMode] = useState<DataMode | undefined>();
  const [healthWarning, setHealthWarning] = useState<string | null>(null);
  const [checkinSaving, setCheckinSaving] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);

  const applyDailyCheckinsResult = useCallback((result: DailyCheckinsQueryResult) => {
    setAllCheckins(result.data);
    setTodayCheckin(getTodayCheckinFromList(result.data));
    setHealthDataMode(result.dataMode);
    setHealthWarning(result.warning ?? null);
    setCheckinError(null);
    return result.data;
  }, [setAllCheckins, setTodayCheckin]);

  const refreshDailyCheckins = async () => {
    try {
      const result = await dailyCheckinsQuery.refetch();
      if (result.error) throw result.error;
      if (!result.data) throw new Error('Falha ao carregar check-ins.');
      return applyDailyCheckinsResult(result.data);
    } catch (error) {
      const message = getErrorMessage(error, 'Falha ao carregar check-ins.');
      setCheckinError(message);
      captureError(error, 'App.loadDailyCheckins');
      return allCheckins;
    }
  };

  const handleSaveRecoveryCheckin = (checkin: RecoveryCheckin) => {
    setRecoveryCheckin(checkin);

    const today = new Date().toISOString().slice(0, 10);
    const dailyFromRecovery: DailyCheckin = {
      id: todayCheckin?.id || crypto.randomUUID(),
      date: today,
      sleepHours: checkin.sleepHours,
      sleepQuality: todayCheckin?.sleepQuality || 3,
      stressLevel: checkin.stressLevel,
      sorenessMap: {
        ...(todayCheckin?.sorenessMap || {}),
        Geral: checkin.sorenessLevel,
      },
      energyLevel: checkin.energyLevel,
      hydrationGlasses: todayCheckin?.hydrationGlasses || 0,
      sleepGoalHours: todayCheckin?.sleepGoalHours || 8,
      notes: todayCheckin?.notes,
      timestamp: Date.now(),
    };

    saveDailyCheckinMutation.mutateAsync(dailyFromRecovery)
      .then(async result => {
        setHealthDataMode(result.dataMode);
        setHealthWarning(result.warning ?? null);
        await refreshDailyCheckins();
      })
      .catch(error => {
        setCheckinError(getErrorMessage(error, 'Falha ao salvar prontidão pré-treino.'));
        captureError(error, 'App.saveRecoveryAsDailyCheckin');
      });
  };

  const handleSaveCheckin = async (checkin: DailyCheckin) => {
    setCheckinSaving(true);
    setCheckinError(null);

    try {
      const saved = await saveDailyCheckinMutation.mutateAsync(checkin);
      setHealthDataMode(saved.dataMode);
      setHealthWarning(saved.warning ?? null);
      const updatedCheckins = await refreshDailyCheckins();
      setTodayCheckin(saved.data);
      onEngagementRefresh(streakData, analyticsHistory, updatedCheckins);
      void recordGamificationEvent('checkin').catch(error => captureError(error, 'App.dailyCheckin'));
      onSnapshotSave(analyticsHistory, streakData, updatedCheckins);
    } catch (error) {
      const normalizedError = toError(error, 'Falha ao salvar check-in.');
      setCheckinError(normalizedError.message);
      captureError(normalizedError, 'App.saveDailyCheckin');
      throw normalizedError;
    } finally {
      setCheckinSaving(false);
    }
  };

  useEffect(() => {
    if (dailyCheckinsQuery.data) {
      applyDailyCheckinsResult(dailyCheckinsQuery.data);
    }
  }, [applyDailyCheckinsResult, dailyCheckinsQuery.data]);

  useEffect(() => {
    if (!dailyCheckinsQuery.error) return;
    const message = getErrorMessage(dailyCheckinsQuery.error, 'Falha ao carregar check-ins.');
    setCheckinError(message);
    captureError(dailyCheckinsQuery.error, 'App.useDailyCheckinsQuery');
  }, [dailyCheckinsQuery.error]);

  return {
    healthDataMode,
    healthWarning,
    checkinSaving,
    checkinError,
    handleSaveCheckin,
    handleSaveRecoveryCheckin,
    refreshDailyCheckins
  };
}
