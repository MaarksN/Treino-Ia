export const REST_TIMER_STORAGE_KEY = '@TreinoIA:activeRestTimer';

export interface PersistedRestTimerState {
  endAt: number;
  duration: number;
  startedAt: number;
}

export function sanitizeRestDuration(seconds: number, fallbackSeconds = 90): number {
  const fallback = Number.isFinite(fallbackSeconds) && fallbackSeconds > 0
    ? Math.round(fallbackSeconds)
    : 90;

  return Number.isFinite(seconds) && seconds > 0
    ? Math.round(seconds)
    : fallback;
}

export function createRestTimerState(
  seconds: number,
  now = Date.now(),
  fallbackSeconds = 90,
): PersistedRestTimerState {
  const duration = sanitizeRestDuration(seconds, fallbackSeconds);

  return {
    duration,
    startedAt: now,
    endAt: now + duration * 1000,
  };
}

export function parsePersistedRestTimerState(raw: string | null): PersistedRestTimerState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedRestTimerState>;
    if (
      !Number.isFinite(parsed.endAt) ||
      !Number.isFinite(parsed.duration) ||
      !Number.isFinite(parsed.startedAt) ||
      Number(parsed.endAt) <= Number(parsed.startedAt) ||
      Number(parsed.duration) <= 0
    ) {
      return null;
    }

    return {
      endAt: Number(parsed.endAt),
      duration: Number(parsed.duration),
      startedAt: Number(parsed.startedAt),
    };
  } catch {
    return null;
  }
}

export function getRestRemainingSeconds(
  state: PersistedRestTimerState | null,
  now = Date.now(),
): number {
  if (!state) return 0;
  const remainingMs = state.endAt - now;
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

export function formatRestSeconds(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(Number.isFinite(seconds) ? seconds : 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}
