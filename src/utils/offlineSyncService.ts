import { listOfflineActions, removeOfflineAction, updateOfflineAction, type OfflineAction } from '../utils/offlineQueue';

/**
 * Offline Sync Service
 * Manages the background synchronization of queued offline actions.
 */

class OfflineSyncService {
  private isSyncing = false;

  async sync() {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    try {
      const pendingActions = await listOfflineActions('pending');
      const failedActions = await listOfflineActions('failed');
      const actionsToSync = [...pendingActions, ...failedActions];

      for (const action of actionsToSync) {
        await this.processAction(action);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async processAction(action: OfflineAction) {
    try {
      // Logic for actual API calls based on action type
      // Example: if (action.type === 'WORKOUT_SESSION') { await syncWorkout(action.payload); }

      // Simulate successful sync for now
      await updateOfflineAction({ ...action, status: 'synced', updatedAt: Date.now() });
      await removeOfflineAction(action.id);
    } catch (error: any) {
      await updateOfflineAction({
        ...action,
        status: 'failed',
        attempts: action.attempts + 1,
        lastError: error.message || 'Unknown sync error',
        updatedAt: Date.now(),
      });
    }
  }

  init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.sync());
      // Periodic check
      setInterval(() => this.sync(), 60000);
    }
  }
}

export const offlineSyncService = new OfflineSyncService();
