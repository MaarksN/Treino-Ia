import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Pause, Play, TimerReset } from 'lucide-react';

interface Props {
  initialSeconds?: number;
  autoStartKey?: string | number;
  onFinish?: () => void;
  onVoiceAlert?: boolean;
}

export function RestTimer({ initialSeconds = 90, autoStartKey, onFinish, onVoiceAlert }: Props) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (autoStartKey === undefined) return;
    setSeconds(initialSeconds);
    setRunning(true);
  }, [autoStartKey, initialSeconds]);

  useEffect(() => {
    if (!running) return undefined;
    if (seconds <= 0) {
      setRunning(false);
      onFinish?.();
      if (onVoiceAlert && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Descanso concluído. Próxima série.');
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
      }
      return undefined;
    }

    const id = window.setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running, seconds, onFinish, onVoiceAlert]);

  const display = useMemo(() => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
  }, [seconds]);

  const progress = initialSeconds > 0 ? seconds / initialSeconds : 0;
  const color = progress > 0.5 ? '#ef4444' : progress > 0.2 ? '#f59e0b' : '#a3e635';
  const circumference = 2 * Math.PI * 22;

  return (
    <div className="sticky bottom-4 z-40 bg-brand-gray/95 backdrop-blur border-2 border-brand-neon/40 p-4 shadow-brutal-neon print:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell size={18} className="text-brand-muted" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-bold">Descanso</p>
            <p className="text-3xl font-black font-mono tabular-nums" style={{ color }}>{display}</p>
          </div>
        </div>

        <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(174,224,255,0.12)" strokeWidth="4" />
          <circle
            cx="26"
            cy="26"
            r="22"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${circumference * (1 - progress)}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRunning(value => !value)}
            aria-label={running ? 'Pausar descanso' : 'Iniciar descanso'}
            title={running ? 'Pausar descanso' : 'Iniciar descanso'}
            className="p-3 bg-brand-neon text-brand-dark border-brutal font-bold hover:scale-105 transition-transform"
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setSeconds(initialSeconds);
            }}
            aria-label="Reiniciar descanso"
            title="Reiniciar descanso"
            className="p-3 bg-brand-dark border-2 border-brand-light/20 text-brand-light hover:border-brand-neon hover:text-brand-neon transition-colors"
          >
            <TimerReset size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
