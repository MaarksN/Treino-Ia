import { DatabaseService, TrainingPlan, PersistenceStatus } from '../database';

export type PlanConsistencyResult =
  | { status: 'success'; plan: TrainingPlan }
  | { status: 'local_fallback'; plan: TrainingPlan }
  | { status: 'partial_failure'; plan: TrainingPlan; error: string }
  | { status: 'requires_remote_sync'; plan: TrainingPlan }
  | { status: 'failed'; error: string };

export const CurrentPlanConsistencyHelper = {
  /**
   * Atomically (as best as we can right now) updates the current plan.
   * Ensures the update either succeeds remotely, succeeds locally as fallback,
   * or explicitly returns a failure status.
   */
  async setCurrentPlan(plan: TrainingPlan): Promise<PlanConsistencyResult> {
    try {
      // Basic validation
      if (!plan || !plan.id) {
        return { status: 'failed', error: 'Invalid plan provided.' };
      }

      const persistenceStatus = await DatabaseService.getPersistenceStatus();

      const success = await DatabaseService.saveCurrentPlan(plan);

      if (success) {
        if (persistenceStatus.mode === 'supabase') {
          return { status: 'success', plan };
        } else {
          return { status: 'local_fallback', plan };
        }
      } else {
        return { status: 'failed', error: 'Failed to save plan.' };
      }
    } catch (err: any) {
      // In case of any unhandled error in the save process
      return { status: 'failed', error: err?.message || 'Unknown error occurred while saving plan.' };
    }
  }
};
