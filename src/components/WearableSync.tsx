import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Bluetooth,
  BluetoothOff,
  Heart,
  Zap,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { HeartRateReading, UserProfile, WearableSession } from '../types';
import { PremiumFeatureGate } from './PremiumPaywall';
import {
  calcHRZones,
  connectHeartRateMonitor,
  disconnectHeartRateMonitor,
  estimateCalories,
  isBluetoothSupported,
  loadWearableSessions,
  saveWearableSession,
} from '../services/bluetoothService';

interface Props {
  profile: UserProfile;
  onSessionComplete?: (session: WearableSession) => void;
}

const ZONE_COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f97316', '#ef4444'];
const ZONE_NAMES = ['Z1 Repouso', 'Z2 Queima', 'Z3 Aeróbico', 'Z4 Anaeróbico', 'Z5 Máximo'];

function formatElapsed(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function getZoneIndex(bpm: number, maxHR: number) {
  const pct = (bpm / maxHR) * 100;
  if (pct < 60) return 0;
  if (pct < 70) return 1;
  if (pct < 80) return 2;
  if (pct < 90) return 3;
  return 4;
}

function getZoneCounts(readings: HeartRateReading[], maxHR: number) {
  return [
    readings.filter(reading => (reading.bpm / maxHR) * 100 < 60).length,
    readings.filter(reading => {
      const pct = (reading.bpm / maxHR) * 100;
      return pct >= 60 && pct < 70;
    }).length,
    readings.filter(reading => {
      const pct = (reading.bpm / maxHR) * 100;
      return pct >= 70 && pct < 80;
    }).length,
    readings.filter(reading => {
      const pct = (reading.bpm / maxHR) * 100;
      return pct >= 80 && pct < 90;
    }).length,
    readings.filter(reading => (reading.bpm / maxHR) * 100 >= 90).length,
  ];
}

export function WearableSync({ profile, onSessionComplete }: Props) {
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [readings, setReadings] = useState<HeartRateReading[]>([]);
  const [currentBPM, setCurrentBPM] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<WearableSession[]>(loadWearableSessions);
  const [tab, setTab] = useState<'live' | 'history'>('live');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<number | null>(null);
  const readingsRef = useRef<HeartRateReading[]>([]);

  const age = profile.age || 30;
  const weight = profile.weight || 75;
  const maxHR = 220 - age;
  const isMale = !String(profile.gender || '').toLowerCase().includes('fem');
  const zone = getZoneIndex(currentBPM || Math.round(maxHR * 0.5), maxHR);
  const chartData = readings.slice(-60).map((reading, index) => ({ t: index, bpm: reading.bpm }));
  const zoneCounts = getZoneCounts(readings, maxHR);

  useEffect(() => {
    if (!sessionStart) return undefined;

    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [sessionStart]);

  useEffect(() => () => {
    disconnectHeartRateMonitor().catch(() => {});
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError('');

    try {
      readingsRef.current = [];
      const name = await connectHeartRateMonitor(reading => {
        readingsRef.current = [...readingsRef.current, reading];
        setReadings(previous => [...previous.slice(-120), reading]);
        setCurrentBPM(reading.bpm);
      });

      setDeviceName(name);
      setConnected(true);
      setSessionStart(Date.now());
      setElapsed(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na conexão Bluetooth.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectHeartRateMonitor();

    if (sessionStart && readingsRef.current.length > 0) {
      const all = readingsRef.current;
      const avgHR = Math.round(all.reduce((sum, reading) => sum + reading.bpm, 0) / all.length);
      const maxBPM = Math.max(...all.map(reading => reading.bpm));
      const minBPM = Math.min(...all.map(reading => reading.bpm));
      const durationMin = Math.max(1, elapsed / 60);
      const session: WearableSession = {
        id: crypto.randomUUID(),
        startedAt: sessionStart,
        endedAt: Date.now(),
        avgHR,
        maxHR: maxBPM,
        minHR: minBPM,
        readings: all,
        deviceName,
        calories: estimateCalories(all, weight, age, isMale, durationMin),
        hrZones: calcHRZones(all, maxHR),
      };

      saveWearableSession(session);
      setSessions(loadWearableSessions());
      onSessionComplete?.(session);
    }

    setConnected(false);
    setReadings([]);
    setCurrentBPM(0);
    setSessionStart(null);
    setElapsed(0);
    readingsRef.current = [];
  };

  return (
    <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Monitor de Frequência Cardíaca</h3>
        {connected
          ? <Bluetooth size={20} className="text-brand-neon" />
          : <BluetoothOff size={20} className="text-brand-muted" />}
      </div>

      <PremiumFeatureGate feature="wearable_sync">
      <div className="flex gap-2 mb-4">
        {(['live', 'history'] as const).map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${tab === item ? 'bg-brand-neon text-brand-dark' : 'bg-white/10 text-brand-muted'}`}
          >
            {item === 'live' ? 'Ao vivo' : 'Histórico'}
          </button>
        ))}
      </div>

      {tab === 'live' && (
        <div className="space-y-4">
          {!isBluetoothSupported() && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">Web Bluetooth requer Chrome/Edge em Android ou Desktop. Não é suportado em Safari/iOS.</p>
            </div>
          )}

          {!connected ? (
            <button
              type="button"
              onClick={handleConnect}
              disabled={connecting || !isBluetoothSupported()}
              className="w-full py-4 bg-brand-neon text-brand-dark font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Bluetooth size={18} />
              {connecting ? 'Conectando...' : 'Conectar monitor Bluetooth'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDisconnect}
              className="w-full py-4 bg-red-500/20 border border-red-500/40 text-red-400 font-black rounded-xl"
            >
              Encerrar sessão e salvar
            </button>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {connected && (
            <div className="space-y-4">
              <div className="flex items-stretch justify-between gap-3">
                <div
                  className="flex flex-col items-center flex-1 p-4 bg-brand-dark rounded-xl border"
                  style={{ borderColor: `${ZONE_COLORS[zone]}50` }}
                >
                  <Heart size={28} style={{ color: ZONE_COLORS[zone] }} className="mb-1" />
                  <p className="text-5xl font-black tabular-nums" style={{ color: ZONE_COLORS[zone] }}>
                    {currentBPM}
                  </p>
                  <p className="text-brand-muted text-xs mt-1">BPM</p>
                  <p className="text-xs font-bold mt-1" style={{ color: ZONE_COLORS[zone] }}>
                    {ZONE_NAMES[zone]}
                  </p>
                </div>

                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="p-3 bg-brand-dark rounded-xl border border-white/10 text-center">
                    <Activity size={16} className="mx-auto mb-1 text-brand-neon" />
                    <p className="text-brand-neon font-black text-xl tabular-nums">{formatElapsed(elapsed)}</p>
                    <p className="text-brand-muted text-xs">Duração</p>
                  </div>
                  <div className="p-3 bg-brand-dark rounded-xl border border-white/10 text-center">
                    <Zap size={16} className="mx-auto mb-1 text-orange-400" />
                    <p className="text-orange-400 font-black text-xl tabular-nums">
                      {Math.round(estimateCalories(readings, weight, age, isMale, elapsed / 60))}
                    </p>
                    <p className="text-brand-muted text-xs">Calorias</p>
                  </div>
                </div>
              </div>

              {chartData.length > 1 && (
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis hide />
                      <YAxis domain={['auto', 'auto']} stroke="#9ca9bb" tick={{ fontSize: 10 }} width={30} />
                      <Tooltip
                        contentStyle={{ background: '#1c1b19', border: 'none', borderRadius: 8 }}
                        formatter={(value: number) => [`${value} BPM`]}
                        labelFormatter={() => ''}
                      />
                      <ReferenceLine y={maxHR * 0.6} stroke={ZONE_COLORS[0]} strokeDasharray="4 4" />
                      <ReferenceLine y={maxHR * 0.7} stroke={ZONE_COLORS[1]} strokeDasharray="4 4" />
                      <ReferenceLine y={maxHR * 0.8} stroke={ZONE_COLORS[2]} strokeDasharray="4 4" />
                      <ReferenceLine y={maxHR * 0.9} stroke={ZONE_COLORS[3]} strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="bpm" stroke={ZONE_COLORS[zone]} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div>
                <p className="text-xs text-brand-muted uppercase tracking-widest mb-2">Zonas de frequência cardíaca</p>
                <div className="space-y-1.5">
                  {ZONE_NAMES.map((name, index) => {
                    const total = readings.length || 1;
                    const pct = Math.round((zoneCounts[index] / total) * 100);
                    return (
                      <div key={name} className="flex items-center gap-2">
                        <span className="text-xs w-24" style={{ color: ZONE_COLORS[index] }}>{name}</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: ZONE_COLORS[index] }}
                          />
                        </div>
                        <span className="text-xs text-brand-muted tabular-nums w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-brand-muted text-center">Dispositivo: <strong className="text-white">{deviceName}</strong></p>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {sessions.length === 0 && (
            <p className="text-brand-muted text-sm text-center py-6">Nenhuma sessão registrada ainda.</p>
          )}
          {[...sessions].reverse().slice(0, 10).map(session => {
            const duration = session.endedAt ? Math.round((session.endedAt - session.startedAt) / 60000) : 0;
            const values = Object.values(session.hrZones);
            const total = values.reduce((sum, count) => sum + count, 0) || 1;

            return (
              <div key={session.id} className="p-4 bg-brand-dark rounded-xl border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{session.deviceName}</p>
                    <p className="text-brand-muted text-xs">{new Date(session.startedAt).toLocaleDateString('pt-BR')} · {duration}min</p>
                  </div>
                  <div className="flex gap-3 text-right">
                    <div>
                      <p className="text-red-400 font-bold text-lg tabular-nums">{session.avgHR}</p>
                      <p className="text-brand-muted text-xs">avg BPM</p>
                    </div>
                    <div>
                      <p className="text-orange-400 font-bold text-lg tabular-nums">{session.calories || '—'}</p>
                      <p className="text-brand-muted text-xs">kcal</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {ZONE_NAMES.map((name, index) => {
                    const pct = Math.round((values[index] / total) * 100);
                    return pct > 0 ? (
                      <div
                        key={name}
                        className="h-2 rounded-full"
                        title={`${name}: ${pct}%`}
                        style={{ width: `${pct}%`, background: ZONE_COLORS[index] }}
                      />
                    ) : null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </PremiumFeatureGate>
    </div>
  );
}
