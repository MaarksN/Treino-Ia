import React from 'react';
import { AlertTriangle, Check, Plus } from 'lucide-react';
import { Exercise, SetLog } from '../types';
import { sanitizeSetLog } from '../services/workoutExecutionService';

interface Props {
  exercise: Exercise;
  onUpdate: (updated: Exercise) => void;
  onSetCompleted?: (setLog: SetLog) => void;
}

export function SetTracker({ exercise, onUpdate, onSetCompleted }: Props) {
  const logs: SetLog[] = exercise.setLogs?.length ? exercise.setLogs : Array.from({ length: exercise.sets }, (_, index) => ({
    setNumber: index + 1,
  }));

  const updateLog = (index: number, partial: Partial<SetLog>) => {
    const previousLog = logs[index];
    const completedAt = Object.prototype.hasOwnProperty.call(partial, 'completedAt')
      ? partial.completedAt
      : previousLog.completedAt;
    const nextLog = sanitizeSetLog({
      ...previousLog,
      ...partial,
      completedAt,
    });
    const next = logs.map((log, currentIndex) =>
      currentIndex === index ? nextLog : log
    );
    onUpdate({ ...exercise, setLogs: next });

    if (!previousLog.completedAt && nextLog.completedAt) {
      onSetCompleted?.(nextLog);
    }
  };

  const addSet = () => {
    const next = [...logs, { setNumber: logs.length + 1 }];
    onUpdate({ ...exercise, setLogs: next, sets: next.length });
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-bold">Séries</p>

      {logs.map((log, index) => (
        <div
          key={`${log.setNumber}-${index}`}
          className={`flex flex-wrap gap-2 items-center p-3 border-2 transition-all ${
            log.failed ? 'border-red-500/40 bg-red-500/5' : 'border-brand-light/10 bg-brand-light/5'
          }`}
        >
          <span className="text-brand-muted text-sm w-5 font-bold font-mono">{log.setNumber}</span>

          <input
            type="number"
            min={0}
            step={0.5}
            placeholder="kg"
            value={log.weight || ''}
            onChange={event => updateLog(index, { weight: Number(event.target.value) || undefined })}
            className="w-16 bg-brand-dark border-2 border-brand-light/10 px-2 py-1.5 text-sm text-brand-neon font-mono text-center outline-none focus:border-brand-neon"
          />

          <input
            type="number"
            min={0}
            placeholder="reps"
            value={log.reps || ''}
            onChange={event => updateLog(index, { reps: Number(event.target.value) || undefined })}
            className="w-16 bg-brand-dark border-2 border-brand-light/10 px-2 py-1.5 text-sm text-brand-light font-mono text-center outline-none focus:border-brand-neon"
          />

          <select
            value={log.rpe || ''}
            onChange={event => updateLog(index, { rpe: Number(event.target.value) || undefined })}
            className="w-20 bg-brand-dark border-2 border-brand-light/10 px-1 py-1.5 text-sm text-brand-light/70 outline-none focus:border-brand-magenta"
          >
            <option value="">RPE</option>
            {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => updateLog(index, { completedAt: log.completedAt ? undefined : Date.now() })}
            title={log.completedAt ? 'Reabrir série' : 'Concluir série'}
            className={`p-1.5 transition-all border-2 ${
              log.completedAt ? 'text-brand-dark bg-brand-neon border-brand-neon' : 'text-brand-muted border-brand-light/10 hover:text-brand-neon hover:border-brand-neon/30'
            }`}
          >
            <Check size={15} />
          </button>

          <button
            type="button"
            onClick={() => updateLog(index, { failed: !log.failed, completedAt: Date.now() })}
            title="Falha concêntrica"
            className={`p-1.5 transition-all border-2 ${
              log.failed ? 'text-red-400 bg-red-500/10 border-red-500/40' : 'text-brand-muted border-brand-light/10 hover:text-red-400 hover:border-red-500/30'
            }`}
          >
            <AlertTriangle size={15} />
          </button>

          <button
            type="button"
            onClick={() => updateLog(index, { technicalFailure: !log.technicalFailure, completedAt: Date.now() })}
            title="Falha técnica"
            className={`px-2 py-1.5 text-xs font-bold transition-all border-2 ${
              log.technicalFailure ? 'text-orange-400 bg-orange-500/10 border-orange-500/40' : 'text-brand-muted border-brand-light/10 hover:text-orange-400'
            }`}
          >
            Téc.
          </button>

          <input
            type="text"
            placeholder="nota"
            value={log.note || ''}
            onChange={event => updateLog(index, { note: event.target.value })}
            className="flex-1 min-w-[120px] bg-brand-dark border-2 border-brand-light/10 px-2 py-1.5 text-xs text-brand-light/70 outline-none focus:border-brand-neon"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addSet}
        className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-neon transition-colors font-bold uppercase"
      >
        <Plus size={16} /> Adicionar série
      </button>
    </div>
  );
}
