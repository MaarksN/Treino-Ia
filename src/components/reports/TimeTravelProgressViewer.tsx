import React from 'react';
import { History, TrendingUp } from 'lucide-react';
import { generateTimeTravelProgress } from '../../services/reports/timeTravelProgressService';
import { WorkoutSession } from '../../services/database';

interface Props {
  history: WorkoutSession[];
}

export function TimeTravelProgressViewer({ history }: Props) {
  const result = generateTimeTravelProgress(history);

  return (
    <div className="rounded-[24px] border-2 border-brand-light/20 bg-brand-dark p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-brand-light/10 p-3 text-brand-light">
          <History className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-2xl uppercase text-brand-light">Time-Travel Retrospective</h3>
          <p className="font-mono text-xs text-brand-light/70">{result.message}</p>
        </div>
      </div>

      {!result.hasEnoughData ? (
        <div className="rounded-[16px] border border-dashed border-brand-light/20 p-8 text-center">
          <p className="font-mono text-sm text-brand-light/60">Histórico insuficiente para viagem no tempo.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {result.snapshots.map((snapshot, i) => (
            <div key={i} className="rounded-[16px] bg-brand-gray p-5">
              <p className="font-mono text-xs uppercase tracking-widest text-brand-light/50 mb-3">
                {snapshot.periodLabel}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-brand-light/70">Treinos:</span>
                  <span className="text-brand-light">{snapshot.totalWorkouts}</span>
                </div>
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-brand-light/70">Volume Total:</span>
                  <span className="text-brand-light">{snapshot.totalVolume.toLocaleString('pt-BR')} kg</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
