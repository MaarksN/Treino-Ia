import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { getOfflineQueueCount } from '../utils/offlineQueue';
import { syncOfflineQueue } from '../utils/syncUtils';

export function ConnectivityBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshCount = async () => {
    setPendingCount(await getOfflineQueueCount());
  };

  useEffect(() => {
    void refreshCount();

    const on = async () => {
      setOnline(true);
      setSyncing(true);

      try {
        await syncOfflineQueue({
          onSynced: () => {
            void refreshCount();
          },
        });
      } finally {
        setSyncing(false);
        void refreshCount();
      }
    };

    const off = () => setOnline(false);
    const queueChanged = () => {
      void refreshCount();
    };

    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    window.addEventListener('app:background-sync', on);
    window.addEventListener('app:offline-queue-changed', queueChanged);

    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      window.removeEventListener('app:background-sync', on);
      window.removeEventListener('app:offline-queue-changed', queueChanged);
    };
  }, []);

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-bold flex items-center justify-between gap-3 ${
        online
          ? 'bg-green-500/10 text-green-300 border-green-500/30'
          : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
      }`}
    >
      <span className="flex items-center gap-2">
        {online ? <Wifi size={16} /> : <WifiOff size={16} />}
        {online ? 'Online - sincronizacao ativa' : 'Offline - acoes salvas na fila local'}
      </span>

      <span className="text-xs opacity-80">
        {syncing ? 'Sincronizando...' : `${pendingCount} pendente(s)`}
      </span>
    </div>
  );
}
