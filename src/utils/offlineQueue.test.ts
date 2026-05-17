import { beforeEach, describe, expect, it } from 'vitest';
import {
  enqueueOfflineAction,
  getOfflineQueueCount,
  listOfflineActions,
  removeOfflineAction,
  updateOfflineAction,
} from './offlineQueue';

describe('offlineQueue', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('usa fallback local seguro quando IndexedDB nao esta disponivel', async () => {
    const action = await enqueueOfflineAction({
      type: ' workout.finished ',
      payload: { sessionId: 's1' },
    });

    const rows = await listOfflineActions();
    expect(action.type).toBe('workout.finished');
    expect(rows).toHaveLength(1);
    expect(await getOfflineQueueCount()).toBe(1);
  });

  it('atualiza e remove itens da fila fallback', async () => {
    const action = await enqueueOfflineAction({
      type: 'profile.saved',
      payload: { profileId: 'p1' },
    });

    await updateOfflineAction({ ...action, status: 'synced' });
    expect(await getOfflineQueueCount()).toBe(0);
    expect(await listOfflineActions('synced')).toHaveLength(1);

    await removeOfflineAction(action.id);
    expect(await listOfflineActions()).toHaveLength(0);
  });

  it('bloqueia action sem tipo operacional', async () => {
    await expect(enqueueOfflineAction({ type: ' ', payload: {} })).rejects.toThrow('type is required');
  });
});
