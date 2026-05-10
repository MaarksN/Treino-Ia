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

function emitQueueChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:offline-queue-changed'));
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
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

export async function enqueueOfflineAction(action: {
  type: string;
  payload: unknown;
}): Promise<OfflineAction> {
  const timestamp = Date.now();

  const row: OfflineAction = {
    id: crypto.randomUUID(),
    type: action.type,
    payload: action.payload,
    status: 'pending',
    attempts: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await withStore('readwrite', store => store.add(row));
  emitQueueChange();

  return row;
}

export async function listOfflineActions(status?: OfflineAction['status']): Promise<OfflineAction[]> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
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
}

export async function updateOfflineAction(action: OfflineAction): Promise<void> {
  await withStore('readwrite', store =>
    store.put({
      ...action,
      updatedAt: Date.now(),
    }),
  );
  emitQueueChange();
}

export async function removeOfflineAction(id: string): Promise<void> {
  await withStore('readwrite', store => store.delete(id));
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
