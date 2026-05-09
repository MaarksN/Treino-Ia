import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { WorkoutHistoryRecord, WorkoutPlan } from '../types';
import { getExerciseHistoryData } from '../services/analyticsService';

interface Props {
  plans: WorkoutPlan[];
  workoutHistory?: WorkoutHistoryRecord[];
  exerciseName: string;
}

export function ProgressCharts({ plans, workoutHistory = [], exerciseName }: Props) {
  const data = getExerciseHistoryData(plans, exerciseName, workoutHistory);

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 h-80 shadow-brutal-light">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-bold">Evolução por exercício</p>
          <h3 className="text-brand-light font-display text-2xl uppercase tracking-widest">{exerciseName}</h3>
        </div>
      </div>

      {data.length ? (
        <ResponsiveContainer width="100%" height="82%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(174,224,255,0.08)" />
            <XAxis dataKey="label" stroke="#4B6B99" tick={{ fontSize: 11 }} />
            <YAxis stroke="#4B6B99" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#050A1F', borderColor: '#00F0FF', color: '#AEE0FF' }}
              labelStyle={{ color: '#AEE0FF' }}
            />
            <Line type="monotone" dataKey="weight" name="Carga" stroke="#00F0FF" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="rpe" name="RPE" stroke="#FF003C" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[82%] flex items-center justify-center text-sm text-brand-muted font-mono text-center border-2 border-dashed border-brand-light/10">
          Sem dados suficientes para gráfico.
        </div>
      )}
    </div>
  );
}
