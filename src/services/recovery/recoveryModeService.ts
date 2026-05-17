import { type WorkoutSession } from '../database';

export function getAccumulatedRpeLoad(history: WorkoutSession[]): number {
  const recent = history.slice(0, 7);
  return recent.reduce((sum, session) => sum + session.exercises.reduce((inner, ex) => {
    const sets = ex.sets ?? [];
    return inner + sets.reduce((s, set) => s + set.rpe, 0);
  }, 0), 0);
}

export function classifyRpeLoad(load: number): 'leve' | 'moderada' | 'alta' | 'muito alta' {
  if (load < 80) return 'leve';
  if (load < 150) return 'moderada';
  if (load < 220) return 'alta';
  return 'muito alta';
}

export function shouldSuggestDayOff(load: number, painIntensity: number): boolean {
  return load >= 150 || painIntensity >= 6;
}
