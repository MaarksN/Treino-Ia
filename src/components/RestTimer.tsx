import React, { useEffect, useMemo, useState } from 'react';
import { Pause, Play, TimerReset } from 'lucide-react';

interface Props {
  initialSeconds?: number;
  autoStartKey?: string | number;
  onFinish?: () => void;
}

export function RestTimer({ initialSeconds = 90, autoStartKey, onFinish }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setRunning(Boolean(autoStartKey));
  }, [initialSeconds, autoStartKey]);

  useEffect(() => {
    if (!running) return undefined;
    if (secondsLeft <= 0) {
      setRunning(false);
      onFinish?.();
      return undefined;
    }

    const id = window.setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [running, secondsLeft, onFinish]);

  const time = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  return (
    <div className="sticky bottom-4 z-30 bg-brand-gray border-2 border-brand-neon/50 p-4 shadow-brutal-neon print:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-bold">Descanso automático</p>
          <h3 className="text-3xl font-black font-mono text-brand-light text-shadow-neon tabular-nums">{time}</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={running ? 'Pausar descanso' : 'Iniciar descanso'}
            title={running ? 'Pausar descanso' : 'Iniciar descanso'}
            onClick={() => setRunning(value => !value)}
            className="p-3 bg-brand-neon text-brand-dark border-brutal hover:scale-105 transition-transform"
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            type="button"
            aria-label="Reiniciar descanso"
            title="Reiniciar descanso"
            onClick={() => {
              setSecondsLeft(initialSeconds);
              setRunning(false);
            }}
            className="p-3 bg-brand-dark border-2 border-brand-light/20 text-brand-light hover:border-brand-neon hover:text-brand-neon transition-colors"
          >
            <TimerReset size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
