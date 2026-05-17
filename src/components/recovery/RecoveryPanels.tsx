import { useMemo, useState } from 'react';
import { type WorkoutSession } from '../../services/database';
import { calculateRpeLoad } from '../../services/recovery/rpeLoadService';
import { calculateSleepStrengthCorrelation } from '../../services/recovery/sleepStrengthCorrelation';
import { estimateCaffeineImpact, sanitizeCaffeineMg } from '../../services/recovery/caffeineImpactService';
import {
  getPainCheckin,
  PAIN_REGIONS,
  savePainCheckin,
  type PainRegion,
} from '../../services/recovery/painCheckinService';

function buildTodayTimestamp(time: string): number {
  const [hour = '0', minute = '0'] = time.split(':');
  const date = new Date();
  date.setHours(Number(hour) || 0, Number(minute) || 0, 0, 0);
  return date.getTime();
}

export function RecoveryPanels({ history }: { history: WorkoutSession[] }) {
  const [painRecord, setPainRecord] = useState(() => getPainCheckin());
  const [region, setRegion] = useState<PainRegion>('ombros');
  const [pain, setPain] = useState(3);
  const [caffeineMg, setCaffeineMg] = useState(80);
  const [caffeineTime, setCaffeineTime] = useState('14:00');

  const sleepStrength = useMemo(() => {
    const sample = history.slice(0, 12).map(session => ({
      sleepHours: 6 + (session.completedExercises % 4),
      strengthScore: session.totalVolume / 100,
    }));
    return calculateSleepStrengthCorrelation(sample);
  }, [history]);

  const rpeLoad = useMemo(() => calculateRpeLoad(history), [history]);
  const painMax = Math.max(...Object.values(painRecord.pain));
  const shouldRecover = rpeLoad.level === 'alta' || rpeLoad.level === 'muito alta' || painMax >= 6;
  const caffeineImpact = useMemo(() => {
    const mg = sanitizeCaffeineMg(caffeineMg);
    return estimateCaffeineImpact(mg > 0 ? [{ mg, loggedAt: buildTodayTimestamp(caffeineTime) }] : []);
  }, [caffeineMg, caffeineTime]);

  const saveSelectedPain = () => {
    const next = savePainCheckin({
      createdAt: Date.now(),
      pain: { ...painRecord.pain, [region]: pain },
    });
    setPainRecord(next);
  };

  return (
    <section className="mb-8 grid gap-4 md:grid-cols-2">
      <article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4 transition hover:-translate-y-0.5">
        <h3 className="font-display text-2xl">Sono x força</h3>
        <p className="font-mono text-sm text-brand-light/80">
          {history.length < 3
            ? 'Dados insuficientes para correlação.'
            : sleepStrength > 0
              ? 'Quando seu sono melhora, seu volume tende a subir.'
              : 'Correlação fraca no período atual.'}
        </p>
      </article>

      <article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4">
        <h3 className="font-display text-2xl">Carga RPE</h3>
        <p className="font-mono text-sm">
          Acumulado: {rpeLoad.score} ({rpeLoad.level})
        </p>
        <p className="font-mono text-xs text-brand-light/70">
          {shouldRecover
            ? 'Dia de recuperação recomendado: mobilidade, caminhada leve e sono.'
            : 'Manter plano atual com recuperação básica.'}
        </p>
      </article>

      <article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4">
        <h3 className="font-display text-2xl">Check-in de dor</h3>
        <div className="mt-2 flex gap-2">
          <select
            value={region}
            onChange={event => setRegion(event.target.value as PainRegion)}
            className="bg-brand-dark p-2"
          >
            {PAIN_REGIONS.map(currentRegion => (
              <option key={currentRegion} value={currentRegion}>
                {currentRegion}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={10}
            value={pain}
            onChange={event => setPain(Number(event.target.value))}
            className="w-20 bg-brand-dark p-2"
          />
          <button type="button" onClick={saveSelectedPain} className="rounded bg-brand-neon px-3 text-brand-dark">
            Salvar
          </button>
        </div>
        <p className="mt-2 font-mono text-xs">
          Último registro: {painMax > 0 ? `${region} (${painRecord.pain[region]}/10)` : 'nenhum'}
        </p>
      </article>

      <article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4">
        <h3 className="font-display text-2xl">Cafeína</h3>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            value={caffeineMg}
            onChange={event => setCaffeineMg(Number(event.target.value))}
            className="w-24 bg-brand-dark p-2"
          />
          <input
            type="time"
            value={caffeineTime}
            onChange={event => setCaffeineTime(event.target.value)}
            className="bg-brand-dark p-2"
          />
        </div>
        <p className="mt-2 font-mono text-xs">{caffeineImpact.message}</p>
        {caffeineImpact.nearSleepMg >= 120 && (
          <p className="font-mono text-xs text-brand-magenta">Atenção: consumo próximo da janela de sono.</p>
        )}
      </article>
    </section>
  );
}
