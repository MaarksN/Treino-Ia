import React from 'react';
import { Activity } from 'lucide-react';

export interface MuscleLoad {
  muscleGroup: string;
  loadPercentage: number;
}

export interface BiomechanicalDigitalTwinProps {
  muscleLoads: MuscleLoad[];
}

export function BiomechanicalDigitalTwin({ muscleLoads }: BiomechanicalDigitalTwinProps) {
  return (
    <div className="rounded-[24px] border-2 border-brand-light bg-brand-gray p-5 shadow-brutal-light">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-brand-light/20 p-2 text-brand-light">
          <Activity className="h-5 w-5" />
        </div>
        <h3 className="font-display text-xl uppercase text-brand-light">
          Gêmeo Digital Biomecânico
        </h3>
      </div>

      <p className="mb-4 font-mono text-xs text-brand-light/70">
        Visão educacional da sobrecarga muscular. (Sem diagnóstico clínico).
      </p>

      <div className="space-y-3">
        {muscleLoads.map((load, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="w-24 font-mono text-sm text-brand-light">{load.muscleGroup}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-brand-dark">
              <div
                className="h-2 rounded-full bg-brand-neon"
                style={{ width: `${load.loadPercentage}%` }}
              />
            </div>
            <span className="w-10 text-right font-mono text-xs text-brand-neon">{load.loadPercentage}%</span>
          </div>
        ))}
        {muscleLoads.length === 0 && (
          <p className="font-mono text-sm text-brand-light/50">Nenhum dado de carga registrado hoje.</p>
        )}
      </div>
    </div>
  );
}
