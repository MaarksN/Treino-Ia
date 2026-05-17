import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createRestTimerState,
  formatRestSeconds,
  getRestRemainingSeconds,
  parsePersistedRestTimerState,
  REST_TIMER_STORAGE_KEY,
  type PersistedRestTimerState,
} from '../services/restTimerEngine';

type RestTimerStatus = 'idle' | 'running' | 'expired';

function getStorage(): Storage | null {
  return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
}

export function useRestTimer(defaultSeconds = 90) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [status, setStatus] = useState<RestTimerStatus>('idle');
  const stateRef = useRef<PersistedRestTimerState | null>(null);

  const stopRest = useCallback(() => {
    stateRef.current = null;
    setStatus('idle');
    setRemainingSeconds(0);
    getStorage()?.removeItem(REST_TIMER_STORAGE_KEY);
  }, []);

  const tick = useCallback(() => {
    const nextRemaining = getRestRemainingSeconds(stateRef.current);
    setRemainingSeconds(nextRemaining);
    if (nextRemaining <= 0) {
      stateRef.current = null;
      setStatus('expired');
      getStorage()?.removeItem(REST_TIMER_STORAGE_KEY);
    }
  }, []);

  const startRest = useCallback((seconds = defaultSeconds) => {
    const state = createRestTimerState(seconds, Date.now(), defaultSeconds);
    stateRef.current = state;
    setStatus('running');
    setRemainingSeconds(state.duration);
    getStorage()?.setItem(REST_TIMER_STORAGE_KEY, JSON.stringify(state));
  }, [defaultSeconds]);

  const resetRest = useCallback(() => {
    startRest(defaultSeconds);
  }, [defaultSeconds, startRest]);

  useEffect(() => {
    const state = parsePersistedRestTimerState(getStorage()?.getItem(REST_TIMER_STORAGE_KEY) ?? null);
    const remaining = getRestRemainingSeconds(state);

    if (state && remaining > 0) {
      stateRef.current = state;
      setStatus('running');
      setRemainingSeconds(remaining);
      return;
    }

    getStorage()?.removeItem(REST_TIMER_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    const interval = setInterval(() => {
      tick();
    }, 250);
    return () => clearInterval(interval);
  }, [status, tick]);

  const formatted = useMemo(() => {
    return formatRestSeconds(remainingSeconds);
  }, [remainingSeconds]);

  return {
    remainingSeconds,
    isRunning: status === 'running',
    isExpired: status === 'expired',
    formatted,
    startRest,
    stopRest,
    resetRest,
  };
}
