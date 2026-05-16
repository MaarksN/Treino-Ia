import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = '@TreinoIA:activeRestTimer';

interface RestTimerState {
  endAt: number;
  duration: number;
}

function readState(): RestTimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RestTimerState;
    if (!parsed.endAt || !parsed.duration) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useRestTimer(defaultSeconds = 90) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const endAtRef = useRef<number | null>(null);

  const stopRest = useCallback(() => {
    endAtRef.current = null;
    setIsRunning(false);
    setRemainingSeconds(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const tick = useCallback(() => {
    if (!endAtRef.current) return;
    const nextRemaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
    setRemainingSeconds(nextRemaining);
    if (nextRemaining <= 0) {
      stopRest();
    }
  }, [stopRest]);

  const startRest = useCallback((seconds = defaultSeconds) => {
    const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : defaultSeconds;
    const endAt = Date.now() + safeSeconds * 1000;
    endAtRef.current = endAt;
    setIsRunning(true);
    setRemainingSeconds(safeSeconds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ endAt, duration: safeSeconds }));
  }, [defaultSeconds]);

  const resetRest = useCallback(() => {
    startRest(defaultSeconds);
  }, [defaultSeconds, startRest]);

  useEffect(() => {
    const state = readState();
    if (state) {
      endAtRef.current = state.endAt;
      setIsRunning(true);
      tick();
    }
  }, [tick]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      tick();
    }, 250);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const formatted = useMemo(() => {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [remainingSeconds]);

  return { remainingSeconds, isRunning, formatted, startRest, stopRest, resetRest };
}
