import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { TrainingExercisePerformance } from '../types';
import {
  calculateWeeklyMuscleVolumes,
  classifyVolume,
} from '../utils/periodizationUtils';

interface Props {
  performances: TrainingExercisePerformance[];
}

export function VolumeLandmarks({ performances }: Props) {
  const rows = useMemo(() => {
    return calculateWeeklyMuscleVolumes(performances).map(item => ({
      ...item,
      classification: classifyVolume(
        item.currentVolume,
        item.mev,
        item.mav,
        item.mrv,
      ),
    }));
  }, [performances]);

  return (
    <section className="bg-brand-gray rounded-3xl border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="text-brand-neon" size={20} />
        <div>
          <h2 className="text-xl font-black text-white">Volume Landmarks</h2>
          <p className="text-sm text-brand-muted">
            MEV, MAV, MRV e volume semanal por grupo muscular.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map(row => {
          const percentage = Math.min(100, Math.round((row.currentVolume / row.mrv) * 100));

          return (
            <div key={row.muscle} className="rounded-2xl bg-brand-dark border border-white/10 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-white">{row.muscle}</p>
                  <p className="text-xs text-brand-muted">
                    MEV {row.mev} · MAV {row.mav} · MRV {row.mrv}
                  </p>
                </div>

                <span className={`text-xs rounded-full border px-3 py-1 ${row.classification.className}`}>
                  {row.classification.label}
                </span>
              </div>

              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-brand-neon"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-brand-muted">Volume atual</span>
                <strong className="text-white">{row.currentVolume} séries/semana</strong>
              </div>

              <p className="text-xs text-white/60 mt-3">
                {row.classification.recommendation}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
