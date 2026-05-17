import { type WorkoutSession } from '../database';

export type RpeLoadLevel = 'leve' | 'moderada' | 'alta' | 'muito alta';

export function calculateRpeLoad(history: WorkoutSession[]): { score: number; level: RpeLoadLevel; message: string } {
  if (!history.length) return { score: 0, level: 'leve', message: 'Dados insuficientes para estimar sua carga interna.' };
  const recent = history.slice(0, 7);
  const score = Number(recent.reduce((sum, session) => {
    const sessionSets = session.exercises.flatMap(ex => ex.sets ?? []);
    const avg = sessionSets.length ? sessionSets.reduce((s, set) => s + set.rpe, 0) / sessionSets.length : 0;
    return sum + avg;
  }, 0).toFixed(1));

  if (score >= 60) return { score, level: 'muito alta', message: 'Carga interna muito alta nesta janela recente.' };
  if (score >= 45) return { score, level: 'alta', message: 'Carga interna alta. Vale priorizar recuperação.' };
  if (score >= 25) return { score, level: 'moderada', message: 'Carga interna moderada e estável.' };
  return { score, level: 'leve', message: 'Carga interna leve no período recente.' };
}
