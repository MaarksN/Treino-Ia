import {
  clearSyncedActions,
  listOfflineActions,
  updateOfflineAction,
} from './offlineQueue';

export interface DashboardSnapshot {
  id: string;
  userId: string;
  sourceDeviceId: string;
  version: number;
  data: unknown;
  updatedAt: number;
}

const DEVICE_KEY = '@TreinoApp:deviceId';
const SNAPSHOT_KEY = '@TreinoApp:dashboardSnapshot';

export function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_KEY);

  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(DEVICE_KEY, id);
  return id;
}

export function saveDashboardSnapshot(userId: string, data: unknown): DashboardSnapshot {
  const previous = loadDashboardSnapshot();

  const snapshot: DashboardSnapshot = {
    id: previous?.id ?? crypto.randomUUID(),
    userId,
    sourceDeviceId: getDeviceId(),
    version: (previous?.version ?? 0) + 1,
    data,
    updatedAt: Date.now(),
  };

  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));

  return snapshot;
}

export function loadDashboardSnapshot(): DashboardSnapshot | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) as DashboardSnapshot : null;
  } catch {
    return null;
  }
}

export function resolveConflict(
  local: DashboardSnapshot,
  remote: DashboardSnapshot,
): DashboardSnapshot {
  if (remote.version > local.version) return remote;
  if (local.version > remote.version) return local;

  return remote.updatedAt > local.updatedAt ? remote : local;
}

export async function syncOfflineQueue(options?: {
  endpoint?: string;
  onSynced?: (count: number) => void;
  onError?: (error: unknown) => void;
}): Promise<void> {
  const endpoint = options?.endpoint ?? '/api/sync/offline-actions';
  const [pendingRows, failedRows] = await Promise.all([
    listOfflineActions('pending'),
    listOfflineActions('failed'),
  ]);
  const pending = [...pendingRows, ...failedRows]
    .sort((a, b) => a.createdAt - b.createdAt);

  let synced = 0;

  for (const action of pending) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': action.id,
        },
        body: JSON.stringify(action),
      });

      if (!response.ok) {
        throw new Error(`Sync falhou com status ${response.status}`);
      }

      await updateOfflineAction({
        ...action,
        status: 'synced',
        attempts: action.attempts + 1,
        lastError: undefined,
      });

      synced += 1;
    } catch (error) {
      await updateOfflineAction({
        ...action,
        status: 'failed',
        attempts: action.attempts + 1,
        lastError: error instanceof Error ? error.message : String(error),
      });

      options?.onError?.(error);
    }
  }

  await clearSyncedActions();
  options?.onSynced?.(synced);
}
