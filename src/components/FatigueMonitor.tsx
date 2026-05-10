import React, { useMemo, useState } from 'react';
import { Activity, AlertTriangle, Battery, Moon, TimerReset } from 'lucide-react';
import { FatigueSnapshot } from '../types';
import {
  calcFatigueScore,
  getFatigueTrafficLight,
  getSessionReadiness,
  shouldAutoDeload,
  suggestExtraRestHours,
} from '../utils/fatigueUtils';

interface Props {
  initialSnapshot?: Partial<FatigueSnapshot>;
}

export function FatigueMonitor({ initialSnapshot }: Props) {
  const [snapshot, setSnapshot] = useState<Omit<FatigueSnapshot, 'fatigueScore'>>({
    date: new Date().toISOString(),
    readiness: initialSnapshot?.readiness ?? 72,
    soreness: initialSnapshot?.soreness ?? 4,
    sleep: initialSnapshot?.sleep ?? 7,
    stress: initialSnapshot?.stress ?? 4,
    hrv: initialSnapshot?.hrv,
    weeklyVolume: initialSnapshot?.weeklyVolume ?? 56,
    completedSessions: initialSnapshot?.completedSessions ?? 4,
    missedSessions: initialSnapshot?.missedSessions ?? 0,
  });

  const computed = useMemo(() => {
    const fatigueScore = calcFatigueScore(snapshot);
    const fullSnapshot = { ...snapshot, fatigueScore };
    const traffic = getFatigueTrafficLight(fatigueScore);
    const readiness = getSessionReadiness(fullSnapshot);
    const autoDeload = shouldAutoDeload(fullSnapshot);
    const restHours = suggestExtraRestHours(fullSnapshot);

    return {
      fatigueScore,
      fullSnapshot,
      traffic,
      readiness,
      autoDeload,
      restHours,
    };
  }, [snapshot]);

  const update = (key: keyof typeof snapshot, value: number) => {
    setSnapshot(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-5">
        <Activity className="text-brand-neon" size={20} />
        <div>
          <h2 className="text-xl font-black text-white">Monitor de Fadiga</h2>
          <p className="text-sm text-brand-muted">
            Auto deload, prontidão da sessão e semáforo de intensidade.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Field
            label="Prontidão"
            value={snapshot.readiness}
            min={0}
            max={100}
            suffix="%"
            onChange={value => update('readiness', value)}
          />

          <Field
            label="Dor muscular"
            value={snapshot.soreness}
            min={0}
            max={10}
            suffix="/10"
            onChange={value => update('soreness', value)}
          />

          <Field
            label="Sono"
            value={snapshot.sleep}
            min={0}
            max={10}
            suffix="/10"
            onChange={value => update('sleep', value)}
          />

          <Field
            label="Estresse"
            value={snapshot.stress}
            min={0}
            max={10}
            suffix="/10"
            onChange={value => update('stress', value)}
          />
        </div>

        <div className="space-y-4">
          <div className={`rounded-2xl border p-4 ${computed.traffic.className}`}>
            <p className="text-xs uppercase tracking-widest opacity-80">Semáforo</p>
            <h3 className="text-2xl font-black">{computed.traffic.label}</h3>
            <p className="text-sm mt-2">Score de fadiga: {computed.fatigueScore}/100</p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-brand-muted uppercase tracking-widest flex items-center gap-1">
              <Battery size={14} />
              Índice de recuperação
            </p>
            <h3 className="text-3xl font-black text-white">
              {computed.readiness.recoveryIndex}/100
            </h3>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-brand-muted uppercase tracking-widest flex items-center gap-1">
              <Moon size={14} />
              Recomendação
            </p>
            <p className="text-sm text-white mt-2">{computed.readiness.recommendation}</p>
          </div>

          {computed.autoDeload && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-300">
              <p className="font-black flex items-center gap-2">
                <AlertTriangle size={16} />
                Auto deload recomendado
              </p>
              <p className="text-sm mt-1">
                Reduza 30-50% do volume e mantenha técnica perfeita.
              </p>
            </div>
          )}

          {computed.restHours > 0 && (
            <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/30 p-4 text-yellow-300">
              <p className="font-black flex items-center gap-2">
                <TimerReset size={16} />
                Descanso extra sugerido
              </p>
              <p className="text-sm mt-1">{computed.restHours}h antes do próximo treino pesado.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}

function Field({ label, value, min, max, suffix, onChange }: FieldProps) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-white">{label}</span>
        <span className="text-sm text-brand-neon">{value}{suffix}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="w-full"
      />
    </label>
  );
}
