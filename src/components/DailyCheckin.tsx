import React, { useState } from 'react';
import { Brain, Droplets, Moon, Save, Zap } from 'lucide-react';
import { DailyCheckin } from '../types';
import { saveCheckin } from '../utils/readinessUtils';

const MUSCLE_REGIONS = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Abdômen',
  'Quadríceps',
  'Posterior',
  'Glúteo',
  'Panturrilha',
];

interface Props {
  onSave: (checkin: DailyCheckin) => void;
  existing?: DailyCheckin | null;
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  step?: number;
  suffix?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

function Slider({ label, value, onChange, max = 10, min = 1, step = 1, suffix = '/10', icon: Icon }: SliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-brand-muted" />
          <span className="text-sm text-brand-light">{label}</span>
        </div>
        <span className="text-brand-neon font-bold tabular-nums">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="w-full accent-brand-neon"
      />
    </div>
  );
}

export function DailyCheckinForm({ onSave, existing }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<DailyCheckin>(existing || {
    id: crypto.randomUUID(),
    date: today,
    sleepHours: 7,
    sleepQuality: 3,
    stressLevel: 5,
    sorenessMap: {},
    energyLevel: 7,
    hydrationGlasses: 0,
    sleepGoalHours: 8,
    timestamp: Date.now(),
  });

  const setField = <K extends keyof DailyCheckin>(key: K, value: DailyCheckin[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const setSoreness = (region: string, value: number) => {
    setForm(current => ({
      ...current,
      sorenessMap: { ...current.sorenessMap, [region]: value },
    }));
  };

  const handleSave = () => {
    const checkin = { ...form, timestamp: Date.now() };
    saveCheckin(checkin);
    onSave(checkin);
  };

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Check-in do dia</h3>
          <p className="font-mono text-xs text-brand-muted mt-1">{form.date}</p>
        </div>
        <Save className="w-5 h-5 text-brand-neon" />
      </div>

      <div className="space-y-5">
        <Slider
          label="Horas de sono"
          icon={Moon}
          value={form.sleepHours}
          onChange={value => setField('sleepHours', value)}
          min={0}
          max={12}
          step={0.5}
          suffix="h"
        />

        <div>
          <p className="text-sm text-brand-light mb-2">Qualidade do sono</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setField('sleepQuality', value)}
                className={`py-2 text-sm font-bold border-2 transition-colors ${
                  form.sleepQuality === value
                    ? 'bg-brand-neon text-brand-dark border-brand-neon'
                    : 'bg-brand-dark text-brand-muted border-brand-light/10 hover:text-brand-light'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <Slider label="Nível de estresse" icon={Brain} value={form.stressLevel} onChange={value => setField('stressLevel', value)} />
        <Slider label="Nível de energia" icon={Zap} value={form.energyLevel} onChange={value => setField('energyLevel', value)} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-brand-muted" />
              <span className="text-sm text-brand-light">Copos de água hoje</span>
            </div>
            <span className="text-brand-neon font-bold">{form.hydrationGlasses}</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[0, 2, 4, 6, 8, 10, 12].map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setField('hydrationGlasses', value)}
                className={`py-2 text-xs font-bold border-2 transition-colors ${
                  form.hydrationGlasses === value
                    ? 'bg-blue-500 text-white border-blue-400'
                    : 'bg-brand-dark text-brand-muted border-brand-light/10 hover:text-brand-light'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-brand-light mb-3">Dor muscular por região</p>
          <div className="space-y-2">
            {MUSCLE_REGIONS.map(region => {
              const value = form.sorenessMap[region] || 0;
              return (
                <div key={region} className="grid grid-cols-[86px_1fr_28px] gap-3 items-center">
                  <span className="text-xs text-brand-muted">{region}</span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={value}
                    onChange={event => setSoreness(region, Number(event.target.value))}
                    className="w-full accent-red-500"
                  />
                  <span className={`text-xs font-bold tabular-nums ${value >= 7 ? 'text-red-400' : value >= 4 ? 'text-orange-400' : 'text-brand-muted'}`}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm text-brand-light mb-2">Meta de sono</p>
          <input
            type="number"
            min={5}
            max={12}
            step={0.5}
            value={form.sleepGoalHours}
            onChange={event => setField('sleepGoalHours', Number(event.target.value))}
            className="w-full bg-brand-dark border-2 border-brand-light/10 px-4 py-3 text-sm text-brand-light outline-none focus:border-brand-neon"
          />
        </div>

        <textarea
          rows={2}
          value={form.notes || ''}
          onChange={event => setField('notes', event.target.value)}
          placeholder="Notas do dia..."
          className="w-full bg-brand-dark border-2 border-brand-light/10 px-4 py-3 text-sm text-brand-light outline-none resize-none placeholder:text-brand-light/30 focus:border-brand-neon"
        />

        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-brand-neon text-brand-dark font-black py-3 border-brutal uppercase tracking-widest hover:bg-brand-neon-hover transition-colors"
        >
          Salvar check-in
        </button>
      </div>
    </div>
  );
}
