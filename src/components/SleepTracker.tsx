import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SleepEntry } from '../types';
import {
  calcSleepDuration,
  getAvgSleepDuration,
  getAvgSleepQuality,
  getSleepQualityColor,
  getSleepQualityLabel,
  loadSleepEntries,
  saveSleepEntry,
} from '../utils/biometricUtils';

const QUALITY_LABELS = ['😴 Péssimo', '😪 Ruim', '😐 Regular', '😊 Bom', '🌟 Excelente'];

function clampQuality(value: number): SleepEntry['quality'] {
  return Math.min(5, Math.max(1, Math.round(value) || 1)) as SleepEntry['quality'];
}

export function SleepTracker() {
  const [entries, setEntries] = useState<SleepEntry[]>(loadSleepEntries);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState<SleepEntry['quality']>(4);
  const [notes, setNotes] = useState('');
  const [tab, setTab] = useState<'log' | 'stats'>('log');

  const today = new Date().toISOString().slice(0, 10);
  const duration = calcSleepDuration(bedtime, wakeTime);
  const durationHours = (duration / 60).toFixed(1);
  const avgQuality = getAvgSleepQuality(entries);
  const avgDuration = getAvgSleepDuration(entries);
  const avgQualityRounded = clampQuality(avgQuality);
  const todayEntry = entries.find(entry => entry.date === today);
  const chartData = entries.slice(-14).map(entry => ({
    date: entry.date.slice(5),
    horas: Number((entry.durationMinutes / 60).toFixed(1)),
    qualidade: entry.quality * 20,
  }));

  const handleSave = () => {
    const entry: SleepEntry = {
      id: todayEntry?.id || crypto.randomUUID(),
      date: today,
      bedtime,
      wakeTime,
      durationMinutes: duration,
      quality,
      notes: notes || undefined,
    };
    saveSleepEntry(entry);
    setEntries(loadSleepEntries());
    setNotes('');
  };

  return (
    <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Sono</h3>
        <Moon size={20} className="text-purple-400" />
      </div>

      <div className="flex gap-2 mb-4">
        {(['log', 'stats'] as const).map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${item === tab ? 'bg-brand-neon text-brand-dark' : 'bg-white/10 text-brand-muted'}`}
          >
            {item === 'log' ? 'Registrar' : 'Estatísticas'}
          </button>
        ))}
      </div>

      {tab === 'log' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-brand-dark rounded-xl border border-white/10">
              <p className="text-brand-muted text-xs mb-1">Média 7 dias</p>
              <p className="text-purple-400 font-black text-2xl tabular-nums">{(avgDuration / 60).toFixed(1)}h</p>
              <p className="text-brand-muted text-xs">duração</p>
            </div>
            <div className="p-4 bg-brand-dark rounded-xl border border-white/10">
              <p className="text-brand-muted text-xs mb-1">Qualidade média</p>
              <p style={{ color: getSleepQualityColor(Math.round(avgQuality)) }} className="font-black text-2xl tabular-nums">
                {avgQuality ? avgQuality.toFixed(1) : '0.0'}/5
              </p>
              <p className="text-brand-muted text-xs">{avgQuality ? getSleepQualityLabel(avgQualityRounded) : 'Sem dados'}</p>
            </div>
          </div>

          {avgDuration < 420 && entries.length >= 3 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 text-sm">Você está dormindo menos de 7h em média. Sono insuficiente reduz recuperação, força e síntese proteica.</p>
            </div>
          )}

          <div className="p-4 bg-brand-dark rounded-xl border border-white/10 space-y-3">
            <p className="text-white font-semibold text-sm">Registrar sono de hoje</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-brand-muted mb-1 flex items-center gap-1"><Moon size={11} /> Dormiu</p>
                <input
                  type="time"
                  value={bedtime}
                  onChange={event => setBedtime(event.target.value)}
                  className="w-full bg-brand-gray border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
                />
              </div>
              <div>
                <p className="text-xs text-brand-muted mb-1 flex items-center gap-1"><Sun size={11} /> Acordou</p>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={event => setWakeTime(event.target.value)}
                  className="w-full bg-brand-gray border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-brand-gray rounded-xl text-center border border-white/5">
              <p className="text-purple-400 font-black text-2xl">{durationHours}h</p>
              <p className="text-brand-muted text-xs">duração calculada</p>
            </div>

            <div>
              <p className="text-xs text-brand-muted mb-2">Qualidade do sono</p>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as const).map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuality(item)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                      quality === item
                        ? 'border-transparent text-brand-dark'
                        : 'border-white/10 text-brand-muted hover:text-white'
                    }`}
                    style={quality === item ? { background: getSleepQualityColor(item) } : {}}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <p className="text-xs text-center mt-1" style={{ color: getSleepQualityColor(quality) }}>
                {QUALITY_LABELS[quality - 1]}
              </p>
            </div>

            <input
              placeholder="Notas (opcional)..."
              value={notes}
              onChange={event => setNotes(event.target.value)}
              className="w-full bg-brand-gray border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
            />

            <button type="button" onClick={handleSave} className="w-full bg-brand-neon text-brand-dark font-bold py-3 rounded-xl">
              {todayEntry ? 'Atualizar' : 'Salvar sono'}
            </button>
          </div>

          <div className="space-y-2">
            {[...entries].reverse().slice(0, 5).map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-brand-dark rounded-xl border border-white/10">
                <div>
                  <p className="text-white text-sm">{entry.date}</p>
                  <p className="text-brand-muted text-xs">{entry.bedtime} → {entry.wakeTime}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-400 font-bold">{(entry.durationMinutes / 60).toFixed(1)}h</p>
                  <p className="text-xs" style={{ color: getSleepQualityColor(entry.quality) }}>
                    {getSleepQualityLabel(entry.quality)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'stats' && (
        <div className="space-y-4">
          <p className="text-sm text-brand-muted">Horas de sono · últimas 2 semanas</p>
          {chartData.length >= 2 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#9ca9bb" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca9bb" tick={{ fontSize: 10 }} domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{ background: '#1c1b19', border: 'none', borderRadius: 8 }}
                    formatter={(value: number) => [`${value}h`]}
                  />
                  <Area type="monotone" dataKey="horas" stroke="#a78bfa" strokeWidth={2} fill="url(#sleepGrad)" dot={{ fill: '#a78bfa', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-brand-muted text-sm text-center py-6">Registre pelo menos 2 noites para ver o gráfico.</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Média 7d', value: `${(avgDuration / 60).toFixed(1)}h`, color: 'text-purple-400' },
              { label: 'Qualidade média', value: `${avgQuality.toFixed(1)}/5`, color: 'text-brand-neon' },
              { label: 'Noites registradas', value: entries.length, color: 'text-blue-400' },
            ].map(item => (
              <div key={item.label} className="p-3 bg-brand-dark rounded-xl border border-white/10 text-center">
                <p className={`font-black text-xl tabular-nums ${item.color}`}>{item.value}</p>
                <p className="text-brand-muted text-xs mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
