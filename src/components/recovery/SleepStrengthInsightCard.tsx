import { calculateSleepStrengthCorrelation, type SleepStrengthEntry } from '../../services/recovery/sleepStrengthCorrelation';

export function SleepStrengthInsightCard({ entries }: { entries: SleepStrengthEntry[] }) {
  const corr = calculateSleepStrengthCorrelation(entries);
  let message = 'Dados insuficientes para calcular correlação sono x força.';
  if (entries.length >= 3) {
    if (corr >= 0.35) message = 'Quando seu sono melhora, seu volume tende a subir.';
    else if (corr <= -0.35) message = 'Sono baixo tem coincidido com queda de performance.';
    else message = 'Correlação fraca no momento. Continue registrando dados.';
  }
  return <article className="rounded-2xl border-2 border-brand-light/20 bg-brand-gray p-4"><h3 className="font-display text-2xl">Sono x Força</h3><p className="mt-2 text-sm text-brand-light/80">{message}</p></article>;
}
