import { listOfflineActions, removeOfflineAction, updateOfflineAction, type OfflineAction } from '../utils/offlineQueue';
import { supabase } from '../services/supabaseClient';

/**
 * Offline Sync Service
 * Manages the background synchronization of queued offline actions.
 * Implements "Last Write Wins" based on updatedAt.
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // Wait for auth

      if (action.type === 'WORKOUT_SESSION') {
        const payload = action.payload as any;
        const { error } = await supabase
          .from('workout_sessions')
          .upsert({
            ...payload,
            user_id: session.user.id,
            updated_at: new Date(action.updatedAt).toISOString()
          }, { onConflict: 'id' });

        if (error) throw error;
      }

      // Successfully synced
      await updateOfflineAction({ ...action, status: 'synced', updatedAt: Date.now() });
      await removeOfflineAction(action.id);
    } catch (error: any) {
      console.error('Sync failed for action:', action.id, error);
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
      this.sync(); // Initial sync
    }
  }
}

export const offlineSyncService = new OfflineSyncService();
