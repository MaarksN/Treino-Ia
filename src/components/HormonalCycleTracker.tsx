import React, { useMemo, useState } from 'react';
import { CycleEntry } from '../types';
import {
  getPhaseForDate,
  loadCycleEntries,
  PHASE_CONFIG,
  saveCycleEntry,
} from '../utils/hormonalUtils';
import { EmptyState } from './ui/EmptyState';
import { InlineNotice } from './ui/InlineNotice';
import { Activity } from 'lucide-react';

export function HormonalCycleTracker() {
  const [cycles, setCycles] = useState<CycleEntry[]>(loadCycleEntries);
  const [startDate, setStartDate] = useState('');
  const [cycleLen, setCycleLen] = useState(28);
  const [periodLen, setPeriodLen] = useState(5);
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const todayPhase = useMemo(() => getPhaseForDate(today, cycles), [today, cycles]);

  const upcoming = useMemo(() => {
    const days = [];
    for (let index = 0; index < 28; index += 1) {
      const date = new Date();
      date.setDate(date.getDate() + index);
      const str = date.toISOString().slice(0, 10);
      const phase = getPhaseForDate(str, cycles);
      if (phase) days.push(phase);
    }
    return days;
  }, [cycles]);

  const handleSave = () => {
    if (!startDate) return;

    const entry: CycleEntry = {
      id: crypto.randomUUID(),
      startDate,
      cycleLengthDays: cycleLen,
      periodLengthDays: periodLen,
    };
    saveCycleEntry(entry);
    setCycles(loadCycleEntries());
    window.dispatchEvent(new CustomEvent('cycle:updated'));
    setShowForm(false);
    setStartDate('');
  };

  const cfg = todayPhase ? PHASE_CONFIG[todayPhase.phase] : null;

  return (
    <div className="bg-brand-gray border border-white/10 rounded-[24px] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-display text-2xl uppercase">Ciclo Hormonal</h3>
        <button
          type="button"
          onClick={() => setShowForm(value => !value)}
          className="text-xs text-brand-neon border border-brand-neon/30 px-3 py-1.5 rounded-full hover:bg-brand-neon/10 transition-all font-mono uppercase tracking-widest"
        >
          + Registrar ciclo
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 bg-brand-dark rounded-xl border border-white/10 space-y-3">
          <div>
            <p className="text-xs text-brand-muted mb-1 font-mono uppercase tracking-widest">Início do ciclo atual</p>
            <input
              type="date"
              value={startDate}
              onChange={event => setStartDate(event.target.value)}
              className="w-full bg-brand-gray border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white outline-none focus:border-brand-neon"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-brand-muted mb-1 font-mono uppercase tracking-widest">Duração</p>
              <input
                type="number"
                value={cycleLen}
                min={21}
                max={40}
                onChange={event => setCycleLen(Number(event.target.value))}
                className="w-full bg-brand-gray border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white outline-none focus:border-brand-neon"
              />
            </div>
            <div>
              <p className="text-xs text-brand-muted mb-1 font-mono uppercase tracking-widest">Menstruação</p>
              <input
                type="number"
                value={periodLen}
                min={2}
                max={10}
                onChange={event => setPeriodLen(Number(event.target.value))}
                className="w-full bg-brand-gray border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white outline-none focus:border-brand-neon"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-brand-neon text-brand-dark font-display text-xl uppercase tracking-widest py-2.5 rounded-xl mt-2"
          >
            Salvar
          </button>
        </div>
      )}

      {!cycles.length ? (
        <EmptyState
          icon={<Activity className="h-8 w-8" />}
          title="Sem ciclo registrado"
          description="Registre seu ciclo para receber recomendações de treino e nutrição personalizadas para cada fase."
        />
      ) : (
        <div className="space-y-4">
          <InlineNotice type="info" title="Educacional">
            Estas estimativas ajudam no manejo de fadiga, mas não substituem acompanhamento ginecológico ou métodos contraceptivos reais.
          </InlineNotice>
          {todayPhase && cfg && (
            <div className="p-4 rounded-xl border" style={{ background: cfg.bg, borderColor: cfg.border }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{cfg.emoji}</span>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: cfg.color }}>
                    Fase atual · Dia {todayPhase.dayOfCycle}
                  </p>
                  <p className="text-white font-display text-2xl uppercase mt-1">{cfg.label}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] font-mono text-brand-muted uppercase tracking-widest">Energia</p>
                  <p className="font-bold font-mono text-sm uppercase mt-1" style={{ color: cfg.color }}>{todayPhase.energyExpected}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-black/20 rounded-lg">
                  <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest mb-1">Treino recomendado</p>
                  <p className="text-white text-sm">{todayPhase.trainingRecommendation}</p>
                </div>
                <div className="p-3 bg-black/20 rounded-lg">
                  <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest mb-1">Nutrição</p>
                  <p className="text-white text-sm">{todayPhase.nutritionTip}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest mb-2">Próximos 28 dias</p>
            <div className="grid grid-cols-7 gap-1">
              {upcoming.map(day => {
                const phaseCfg = PHASE_CONFIG[day.phase];
                const isToday = day.date === today;
                return (
                  <div
                    key={day.date}
                    title={`${day.date}: ${phaseCfg.label}`}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold border transition-all ${isToday ? 'ring-2 ring-brand-light scale-110 z-10 shadow-lg' : ''}`}
                    style={{ background: phaseCfg.bg, borderColor: phaseCfg.border, color: phaseCfg.color }}
                  >
                    {new Date(`${day.date}T00:00:00`).getDate()}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 mt-3 flex-wrap">
              {Object.values(PHASE_CONFIG).map(phase => (
                <div key={phase.label} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ background: phase.color }} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">{phase.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
