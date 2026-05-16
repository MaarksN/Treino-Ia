import { useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { captureError } from '../utils/errorTelemetry';
import { 
  loadTrainingStateFromBackend, 
  migrateLegacyTrainingStateToBackend 
} from '../services/legacyTrainingSyncService';

interface UseTrainingSyncOptions {
  onGoToDashboard: () => void;
}

export function useTrainingSync({ onGoToDashboard }: UseTrainingSyncOptions) {
  const { setProfile, setWorkoutHistory, setPlans, setCurrentPlanId } = useAppStore();

  const hydrateTrainingState = useCallback(async () => {
    try {
      const result = await loadTrainingStateFromBackend();
      if (result.dataMode !== 'supabase') return;

      if (result.profile) {
        setProfile(result.profile);
      }

      if (result.history.length) {
        setWorkoutHistory(result.history);
      }

      if (result.plans.length) {
        setPlans(result.plans);
        setCurrentPlanId(result.currentPlanId || result.plans[0].id);
        onGoToDashboard();
      }
    } catch (error) {
      captureError(error, 'App.hydrateTrainingStateFromBackend');
    }
  }, [setProfile, setWorkoutHistory, setPlans, setCurrentPlanId, onGoToDashboard]);

  const migrateLegacyTrainingState = useCallback(async () => {
    try {
      const result = await migrateLegacyTrainingStateToBackend();
      if (result.dataMode === 'supabase') {
        await hydrateTrainingState();
      }
    } catch (error) {
      captureError(error, 'App.migrateLegacyTrainingState');
    }
  }, [hydrateTrainingState]);

  return {
    hydrateTrainingState,
    migrateLegacyTrainingState
  };
}
