import { useMemo } from 'react';
import { calculateLongevitySignal, LONGEVITY_DISCLAIMER } from '../../services/wellness/longevitySignalService';
import { type WorkoutSession } from '../../services/database';
import { loadHydrationEntries, loadHydrationGoal, loadSleepEntries } from '../../utils/biometricUtils';
import { type HydrationEntry, type SleepEntry } from '../../types';
import { InlineNotice } from '../ui/InlineNotice';

const LEVEL_COLORS: Record<string, string> = {
  excelente: 'text-brand-neon', bom: 'text-brand-neon', moderado: 'text-brand-gold', baixo: 'text-brand-magenta',
};

interface LongevitySignalPanelProps {
  history: WorkoutSession[];
  hydrationEntries?: HydrationEntry[];
  hydrationGoalMl?: number;
  sleepEntries?: SleepEntry[];
}

export function LongevitySignalPanel({
  history,
  hydrationEntries,
  hydrationGoalMl,
  sleepEntries,
}: LongevitySignalPanelProps) {
  const signal = useMemo(() => {
    const localHydrationGoal = hydrationGoalMl ?? loadHydrationGoal().dailyMl;
    return calculateLongevitySignal({
      history,
      hydrationEntries: hydrationEntries ?? loadHydrationEntries(),
      hydrationGoalMl: localHydrationGoal,
      sleepEntries: sleepEntries ?? loadSleepEntries(),
    });
  }, [history, hydrationEntries, hydrationGoalMl, sleepEntries]);

  return (
    <article className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6" aria-labelledby="longevity-title">
      <h3 id="longevity-title" className="font-display text-3xl uppercase text-brand-light">Sinal de consistência</h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">Indicador educativo de hábitos de treino.</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand-neon/30 bg-brand-dark">
          <span className={`font-display text-2xl ${LEVEL_COLORS[signal.level] ?? 'text-brand-light'}`}>{signal.consistencyScore}</span>
        </div>
        <div>
          <p className={`font-mono text-sm font-bold ${LEVEL_COLORS[signal.level] ?? 'text-brand-light'}`}>{signal.label}</p>
          <p className="font-mono text-[10px] text-brand-muted">Baseado em {history.length} sessões registradas.</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {signal.factors.map(factor => (
          <div key={factor.id} className="rounded-xl border border-brand-light/10 bg-brand-dark/30 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-brand-light">{factor.name}</span>
              <span className="font-mono text-xs text-brand-neon">{factor.score}/{factor.maxScore}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-dark">
              <div className="h-full rounded-full bg-brand-neon transition-all" style={{ width: `${factor.score}%` }} />
            </div>
            <p className="mt-1 font-mono text-[10px] text-brand-muted">{factor.description}</p>
          </div>
        ))}
      </div>
      <InlineNotice type="warning" title="Indicador educativo">{LONGEVITY_DISCLAIMER}</InlineNotice>
    </article>
  );
}
