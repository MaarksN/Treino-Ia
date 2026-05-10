import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Smartphone,
} from 'lucide-react';
import { ConnectivityBanner } from './ConnectivityBanner';
import { PushCenter } from './PushCenter';
import { enqueueOfflineAction, getOfflineQueueCount } from '../utils/offlineQueue';
import { loadDashboardSnapshot, saveDashboardSnapshot, syncOfflineQueue } from '../utils/syncUtils';
import { captureError, loadErrorTelemetry } from '../utils/errorTelemetry';
import { isStandalone, registerBackgroundSync } from '../utils/pwaUtils';

export function InfrastructureHub() {
  const [queueCount, setQueueCount] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [snapshotVersion, setSnapshotVersion] = useState<number | null>(null);
  const [syncMessage, setSyncMessage] = useState('');

  const refresh = async () => {
    setQueueCount(await getOfflineQueueCount());
    setErrorsCount(loadErrorTelemetry().length);
    setSnapshotVersion(loadDashboardSnapshot()?.version ?? null);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const addOfflineDemo = async () => {
    await enqueueOfflineAction({
      type: 'WORKOUT_SESSION_COMPLETED',
      payload: {
        workoutId: crypto.randomUUID(),
        completedAt: new Date().toISOString(),
        totalVolume: 4200,
      },
    });
    await registerBackgroundSync();
    await refresh();
  };

  const sync = async () => {
    let failed = 0;
    setSyncMessage('Sincronizando...');

    await syncOfflineQueue({
      endpoint: '/api/sync/offline-actions',
      onSynced: count => {
        setSyncMessage(`${count} acao(oes) sincronizada(s).`);
      },
      onError: () => {
        failed += 1;
      },
    });

    if (failed > 0) {
      setSyncMessage('Sync local preparado. Configure /api/sync/offline-actions em producao.');
    }

    await refresh();
  };

  const saveSnapshot = () => {
    const snapshot = saveDashboardSnapshot('local-user', {
      totalWorkouts: 12,
      currentStreak: 7,
      lastWorkoutAt: new Date().toISOString(),
    });

    setSnapshotVersion(snapshot.version);
  };

  const createError = () => {
    captureError(new Error('Erro demo de telemetria'), 'InfrastructureHub.demo');
    void refresh();
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6">
      <header className="max-w-7xl mx-auto mb-8">
        <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
          Bloco 11
        </p>

        <h1 className="text-4xl font-black mt-2">
          Infraestrutura Premium
        </h1>

        <p className="text-brand-muted mt-2 max-w-3xl">
          PWA, offline-first, service worker, push, fila local, sync multi-device,
          snapshot do dashboard e telemetria de erros.
        </p>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <ConnectivityBanner />

        <section className="grid md:grid-cols-4 gap-4">
          <StatusCard
            icon={<Smartphone />}
            label="Instalado"
            value={isStandalone() ? 'Sim' : 'Nao'}
          />

          <StatusCard
            icon={<Database />}
            label="Fila offline"
            value={queueCount}
          />

          <StatusCard
            icon={<HardDrive />}
            label="Snapshot"
            value={snapshotVersion ? `v${snapshotVersion}` : 'Nao salvo'}
          />

          <StatusCard
            icon={<AlertTriangle />}
            label="Erros locais"
            value={errorsCount}
          />
        </section>

        <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Server className="text-brand-neon" />
            <h2 className="text-2xl font-black text-white">
              Acoes de infraestrutura
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={addOfflineDemo}
              className="bg-white/10 text-white rounded-xl px-4 py-3 font-bold flex items-center gap-2"
            >
              <Database size={16} />
              Criar acao offline
            </button>

            <button
              type="button"
              onClick={sync}
              className="bg-brand-neon text-brand-dark rounded-xl px-4 py-3 font-black flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Sincronizar
            </button>

            <button
              type="button"
              onClick={saveSnapshot}
              className="bg-white/10 text-white rounded-xl px-4 py-3 font-bold flex items-center gap-2"
            >
              <HardDrive size={16} />
              Salvar snapshot
            </button>

            <button
              type="button"
              onClick={createError}
              className="bg-red-500/10 text-red-300 border border-red-500/30 rounded-xl px-4 py-3 font-bold flex items-center gap-2"
            >
              <AlertTriangle size={16} />
              Simular erro
            </button>
          </div>

          {syncMessage && (
            <p className="text-brand-neon text-sm mt-4">{syncMessage}</p>
          )}
        </section>

        <PushCenter />

        <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-brand-neon" />
            <h2 className="text-2xl font-black text-white">
              Cobertura dos itens 211-230
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {[
              '211. Web App Manifest',
              '212. Icones PWA',
              '213. Install prompt',
              '214. Service worker',
              '215. Offline page',
              '216. Cache do app shell',
              '217. Cache de dados recentes',
              '218. Fila offline',
              '219. Sync quando voltar conexao',
              '220. Indicador online/offline',
              '221. Push notifications',
              '222. Centro de preferencias de push',
              '223. Background sync',
              '224. Atualizacao do app',
              '225. Banner nova versao',
              '226. Sync multi-device',
              '227. Resolucao de conflito simples',
              '228. IndexedDB para fila local',
              '229. Snapshot local do dashboard',
              '230. Telemetria de erros',
            ].map(item => (
              <div key={item} className="rounded-2xl bg-brand-dark border border-white/10 p-4 text-white/80">
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-brand-gray rounded-3xl border border-white/10 p-5">
      <div className="text-brand-neon mb-3">{icon}</div>
      <p className="text-xs text-brand-muted uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
    </div>
  );
}
