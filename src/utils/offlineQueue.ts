export interface OfflineAction {
  id: string;
  type: string;
  payload: unknown;
  status: 'pending' | 'synced' | 'failed';
  attempts: number;
  createdAt: number;
  updatedAt: number;
  lastError?: string;
}

const DB_NAME = 'TreinoAppOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_actions';
const FALLBACK_STORAGE_KEY = '@TreinoApp:offlineQueue:v1';

function emitQueueChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:offline-queue-changed'));
  }
}

function createActionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function createOfflineAction(action: { type: string; payload: unknown }): OfflineAction {
  const type = action.type.trim();

  if (!type) {
    throw new Error('Offline action type is required.');
  }

  const timestamp = Date.now();

  return {
    id: createActionId(),
    type,
    payload: action.payload,
    status: 'pending',
    attempts: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined';
}

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readFallbackActions(): OfflineAction[] {
  if (!hasLocalStorage()) return [];

  try {
    const raw = window.localStorage.getItem(FALLBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) as OfflineAction[] : [];
  } catch {
    return [];
  }
}

function writeFallbackActions(actions: OfflineAction[]): void {
  if (!hasLocalStorage()) return;
  window.localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(actions));
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error('IndexedDB unavailable.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status');
        store.createIndex('createdAt', 'createdAt');
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = callback(store);

    tx.oncomplete = () => {
      db.close();
      resolve(request ? (request.result as T) : undefined);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function tryIndexedDb<T>(operation: () => Promise<T>): Promise<T | null> {
  try {
    return await operation();
  } catch {
    return null;
  }
}

export async function enqueueOfflineAction(action: {
  type: string;
  payload: unknown;
}): Promise<OfflineAction> {
  const row = createOfflineAction(action);
  const indexedDbSaved = await tryIndexedDb(async () => {
    await withStore('readwrite', store => store.add(row));
    return true;
  });

  if (!indexedDbSaved) {
    writeFallbackActions([row, ...readFallbackActions()]);
  }

  emitQueueChange();
  return row;
}

export async function listOfflineActions(status?: OfflineAction['status']): Promise<OfflineAction[]> {
  const indexedDbRows = await tryIndexedDb(async () => {
    const db = await openDb();

    return await new Promise<OfflineAction[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = status
        ? store.index('status').getAll(status)
        : store.getAll();

      request.onsuccess = () => resolve(request.result as OfflineAction[]);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  });

  const rows = indexedDbRows ?? readFallbackActions();
  return status ? rows.filter(row => row.status === status) : rows;
}

export async function updateOfflineAction(action: OfflineAction): Promise<void> {
  const nextAction = {
    ...action,
    updatedAt: Date.now(),
  };
  const indexedDbUpdated = await tryIndexedDb(async () => {
    await withStore('readwrite', store => store.put(nextAction));
    return true;
  });

  if (!indexedDbUpdated) {
    writeFallbackActions(readFallbackActions().map(row => (
      row.id === nextAction.id ? nextAction : row
    )));
  }

  emitQueueChange();
}

export async function removeOfflineAction(id: string): Promise<void> {
  const indexedDbRemoved = await tryIndexedDb(async () => {
    await withStore('readwrite', store => store.delete(id));
    return true;
  });

  if (!indexedDbRemoved) {
    writeFallbackActions(readFallbackActions().filter(row => row.id !== id));
  }

  emitQueueChange();
}

export async function clearSyncedActions(): Promise<void> {
  const rows = await listOfflineActions('synced');

  await Promise.all(rows.map(row => removeOfflineAction(row.id)));
  emitQueueChange();
}

export async function getOfflineQueueCount(): Promise<number> {
  const [pending, failed] = await Promise.all([
    listOfflineActions('pending'),
    listOfflineActions('failed'),
  ]);

  return pending.length + failed.length;
}
