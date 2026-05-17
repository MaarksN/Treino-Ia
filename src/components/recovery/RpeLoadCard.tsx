import { type RpeLoadLevel } from '../../services/recovery/rpeLoadService';

export function RpeLoadCard({ score, level, message }: { score: number; level: RpeLoadLevel; message: string }) {
  return <article className="rounded-2xl border-2 border-brand-light/20 bg-brand-gray p-4"><h3 className="font-display text-2xl">RPE acumulado</h3><p className="mt-2 text-sm">Nível: <strong>{level}</strong> · Score: {score}</p><p className="text-xs text-brand-light/80">{message}</p></article>;
}
