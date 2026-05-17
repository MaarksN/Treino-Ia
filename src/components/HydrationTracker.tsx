import React, { useEffect, useState } from 'react';
import { Droplets, Plus } from 'lucide-react';
import { HydrationEntry } from '../types';
import {
  calcHydrationGoal,
  getTodayHydration,
  loadHydrationEntries,
  loadHydrationGoal,
  saveHydrationEntry,
  saveHydrationGoal,
} from '../utils/biometricUtils';
import { HYDRATION_QUICK_ADD_EVENT } from '../utils/hydrationQuickActions';
import { showHydrationReminderNotification } from '../utils/pwaUtils';

const QUICK_OPTIONS = [
  { label: '200ml', ml: 200, emoji: '🥤' },
  { label: '350ml', ml: 350, emoji: '🧋' },
  { label: '500ml', ml: 500, emoji: '🍶' },
  { label: '1L', ml: 1000, emoji: '🫙' },
];

const TYPE_OPTIONS: HydrationEntry['type'][] = ['água', 'isotônico', 'whey', 'café', 'outro'];
const TYPE_EMOJI: Record<HydrationEntry['type'], string> = {
  água: '💧',
  isotônico: '⚡',
  whey: '🥛',
  café: '☕',
  outro: '🥤',
};

interface Props {
  weightKg?: number;
  workoutMinutes?: number;
}

export function HydrationTracker({ weightKg = 75, workoutMinutes = 0 }: Props) {
  const [entries, setEntries] = useState<HydrationEntry[]>(loadHydrationEntries);
  const [goal, setGoal] = useState(loadHydrationGoal);
  const [customMl, setCustomMl] = useState('');
  const [selectedType, setSelectedType] = useState<HydrationEntry['type']>('água');
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [newGoalMl, setNewGoalMl] = useState(goal.dailyMl);

  const todayMl = getTodayHydration(entries);
  const pct = Math.min((todayMl / goal.dailyMl) * 100, 100);
  const remaining = Math.max(goal.dailyMl - todayMl, 0);
  const suggested = calcHydrationGoal(weightKg, workoutMinutes);
  const today = new Date().toISOString().slice(0, 10);
  const todayEntries = entries.filter(entry => entry.date === today).reverse();

  useEffect(() => {
    const refreshEntries = () => setEntries(loadHydrationEntries());

    window.addEventListener(HYDRATION_QUICK_ADD_EVENT, refreshEntries);

    return () => {
      window.removeEventListener(HYDRATION_QUICK_ADD_EVENT, refreshEntries);
    };
  }, []);

  useEffect(() => {
    if (!goal.remindEveryMinutes || !('Notification' in window)) return undefined;

    let intervalId: number | undefined;
    let cancelled = false;

    Notification.requestPermission().then(permission => {
      if (cancelled || permission !== 'granted') return;
      intervalId = window.setInterval(() => {
        const total = getTodayHydration(loadHydrationEntries());
        if (total < goal.dailyMl) {
          void showHydrationReminderNotification(total, goal.dailyMl);
        }
      }, goal.remindEveryMinutes * 60 * 1000);
    }).catch(() => {});

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [goal]);

  const addEntry = (ml: number) => {
    const entry: HydrationEntry = {
      id: crypto.randomUUID(),
      date: today,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      amountMl: ml,
      type: selectedType,
    };
    saveHydrationEntry(entry);
    setEntries(loadHydrationEntries());
  };

  const handleCustom = () => {
    const ml = Number(customMl);
    if (ml <= 0) return;
    addEntry(ml);
    setCustomMl('');
  };

  const saveGoal = () => {
    const updated = { ...goal, dailyMl: Math.max(250, newGoalMl) };
    setGoal(updated);
    saveHydrationGoal(updated);
    setShowGoalEdit(false);
  };

  const pctColor = pct >= 100 ? '#a3e635' : pct >= 60 ? '#22d3ee' : pct >= 30 ? '#fbbf24' : '#ef4444';
  const circumference = 2 * Math.PI * 42;

  return (
    <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Hidratação</h3>
        <Droplets size={20} style={{ color: pctColor }} />
      </div>

      <div className="flex items-center gap-5 mb-5">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={pctColor}
              strokeWidth="10"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-white font-black text-lg tabular-nums leading-none">
              {(todayMl / 1000).toFixed(1)}L
            </p>
            <p className="text-brand-muted text-[10px]">{Math.round(pct)}%</p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <p className="text-brand-muted text-xs">Meta diária</p>
            <p className="text-white font-bold">{(goal.dailyMl / 1000).toFixed(1)}L</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Faltam</p>
            <p style={{ color: pctColor }} className="font-bold">{(remaining / 1000).toFixed(1)}L</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Sugerido para você</p>
            <p className="text-brand-muted text-sm">{(suggested / 1000).toFixed(1)}L</p>
          </div>
          <button type="button" onClick={() => setShowGoalEdit(value => !value)} className="text-xs text-brand-neon hover:underline">
            Editar meta
          </button>
        </div>
      </div>

      {showGoalEdit && (
        <div className="mb-4 p-3 bg-brand-dark rounded-xl border border-white/10 flex gap-2">
          <input
            type="number"
            value={newGoalMl}
            onChange={event => setNewGoalMl(Number(event.target.value))}
            className="flex-1 bg-brand-gray border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none min-w-0"
            placeholder="ml por dia"
          />
          <button type="button" onClick={saveGoal} className="px-4 bg-brand-neon text-brand-dark font-bold rounded-xl text-sm">
            OK
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-3 flex-wrap">
        {TYPE_OPTIONS.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedType === type ? 'bg-brand-neon text-brand-dark' : 'bg-white/10 text-brand-muted'
            }`}
          >
            {TYPE_EMOJI[type]} {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {QUICK_OPTIONS.map(option => (
          <button
            key={option.ml}
            type="button"
            onClick={() => addEntry(option.ml)}
            className="flex flex-col items-center py-3 bg-brand-dark rounded-xl border border-white/10 hover:border-brand-neon/40 transition-all"
          >
            <span className="text-xl mb-0.5">{option.emoji}</span>
            <p className="text-white text-xs font-bold">{option.label}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="number"
          placeholder="ml customizado..."
          value={customMl}
          onChange={event => setCustomMl(event.target.value)}
          onKeyDown={event => event.key === 'Enter' && handleCustom()}
          className="flex-1 bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none min-w-0"
        />
        <button type="button" onClick={handleCustom} className="px-4 bg-brand-neon text-brand-dark font-bold rounded-xl" aria-label="Adicionar hidratação">
          <Plus size={16} />
        </button>
      </div>

      {todayEntries.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-brand-muted uppercase tracking-widest mb-2">Hoje</p>
          {todayEntries.slice(0, 6).map(entry => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm">{TYPE_EMOJI[entry.type]} <span className="text-brand-muted text-xs">{entry.type}</span></span>
              <div className="flex items-center gap-3">
                <span className="text-brand-neon font-bold text-sm tabular-nums">+{entry.amountMl}ml</span>
                <span className="text-brand-muted text-xs">{entry.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
