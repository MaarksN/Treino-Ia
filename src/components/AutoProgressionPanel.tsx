import React, { useMemo } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Repeat2, Sparkles } from 'lucide-react';
import { LoadAction, TrainingExercisePerformance } from '../types';
import {
  createLoadSuggestion,
  shouldSuggestExerciseSwap,
} from '../utils/periodizationUtils';

interface Props {
  performances: TrainingExercisePerformance[];
  fatigueScore: number;
}

export function AutoProgressionPanel({ performances, fatigueScore }: Props) {
  const suggestions = useMemo(() => {
    return performances.map(performance => ({
      performance,
      suggestion: createLoadSuggestion(performance, fatigueScore),
      shouldSwap: shouldSuggestExerciseSwap(performance),
    }));
  }, [performances, fatigueScore]);

  return (
    <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="text-brand-neon" size={20} />
        <div>
          <h2 className="text-xl font-black text-white">Auto Progressão</h2>
          <p className="text-sm text-brand-muted">
            Progressão, regressão e troca inteligente de exercício.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map(({ performance, suggestion, shouldSwap }) => {
          const actionStyle = getActionStyle(suggestion.action);
          const Icon = actionStyle.icon;

          return (
            <div key={performance.exerciseName} className="rounded-2xl bg-brand-dark border border-white/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-black text-white">{performance.exerciseName}</h3>
                  <p className="text-xs text-brand-muted">
                    Carga atual: {performance.currentLoad}kg · Meta: {performance.targetReps} reps · Feito: {performance.actualReps} reps · RPE {performance.rpe}
                  </p>
                </div>

                <span className={`rounded-full border px-3 py-1 text-xs font-bold flex items-center gap-1 ${actionStyle.className}`}>
                  <Icon size={14} />
                  {actionStyle.label}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-3 mt-4">
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-brand-muted">Carga sugerida</p>
                  <p className="text-xl font-black text-white">{suggestion.suggestedLoad}kg</p>
                </div>

                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-brand-muted">Confiança</p>
                  <p className="text-xl font-black text-white">{suggestion.confidence}%</p>
                </div>

                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-brand-muted">Troca</p>
                  <p className="text-xl font-black text-white">{shouldSwap ? 'Sim' : 'Não'}</p>
                </div>
              </div>

              <p className="text-sm text-white/70 mt-3">{suggestion.reason}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function getActionStyle(action: LoadAction) {
  if (action === 'increase') {
    return {
      label: 'Aumentar',
      icon: ArrowUp,
      className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    };
  }

  if (action === 'decrease') {
    return {
      label: 'Reduzir',
      icon: ArrowDown,
      className: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    };
  }

  if (action === 'swap') {
    return {
      label: 'Trocar',
      icon: Repeat2,
      className: 'bg-red-500/10 text-red-300 border-red-500/30',
    };
  }

  return {
    label: 'Manter',
    icon: ArrowRight,
    className: 'bg-white/10 text-white border-white/20',
  };
}
