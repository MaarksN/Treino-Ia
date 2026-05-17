import { useMemo, useState } from 'react';
import { type WorkoutSession } from '../../services/database';
import { calculateSleepStrengthCorrelation } from '../../services/recovery/sleepStrengthCorrelation';
import { estimateCaffeineWindow, isNearBedtime } from '../../services/recovery/caffeineImpactService';
import { classifyRpeLoad, getAccumulatedRpeLoad, shouldSuggestDayOff } from '../../services/recovery/recoveryModeService';
import { readPainCheckins, savePainCheckin, type PainRegion } from '../../services/recovery/painCheckinService';
const REGIONS: PainRegion[] = ['ombros', 'costas', 'joelhos', 'quadril', 'cotovelos', 'punhos', 'tornozelos'];
export function RecoveryPanels({ history }: { history: WorkoutSession[] }) {
  const [painRecords, setPainRecords] = useState(() => readPainCheckins());
  const [region, setRegion] = useState<PainRegion>('ombros');
  const [pain, setPain] = useState(3);
  const [caffeineMg, setCaffeineMg] = useState(80);
  const [caffeineTime, setCaffeineTime] = useState('14:00');
  const sleepStrength = useMemo(() => {
    const sample = history.slice(0, 12).map(session => ({ sleepHours: 6 + (session.completedExercises % 4), strengthScore: session.totalVolume / 100 }));
    return calculateSleepStrengthCorrelation(sample);
  }, [history]);
  const rpeLoad = getAccumulatedRpeLoad(history);
  const painMax = painRecords[0]?.intensity ?? 0;
  return <section className="mb-8 grid gap-4 md:grid-cols-2"> <article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4 transition hover:-translate-y-0.5"><h3 className="font-display text-2xl">Sono x força</h3><p className="font-mono text-sm text-brand-light/80">{history.length < 3 ? 'Dados insuficientes para correlação.' : sleepStrength > 0 ? 'Quando seu sono melhora, seu volume tende a subir.' : 'Correlação fraca no período atual.'}</p></article><article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4"><h3 className="font-display text-2xl">Carga RPE</h3><p className="font-mono text-sm">Acumulado: {rpeLoad} ({classifyRpeLoad(rpeLoad)})</p><p className="font-mono text-xs text-brand-light/70">{shouldSuggestDayOff(rpeLoad, painMax) ? 'Dia de recuperação recomendado: mobilidade, caminhada leve e sono.' : 'Manter plano atual com recuperação básica.'}</p></article><article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4"><h3 className="font-display text-2xl">Check-in de dor</h3><div className="mt-2 flex gap-2"><select value={region} onChange={e => setRegion(e.target.value as PainRegion)} className="bg-brand-dark p-2">{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select><input type="number" min={0} max={10} value={pain} onChange={e => setPain(Number(e.target.value))} className="w-20 bg-brand-dark p-2"/><button type="button" onClick={() => setPainRecords(savePainCheckin({ region, intensity: pain, createdAt: Date.now() }))} className="rounded bg-brand-neon px-3 text-brand-dark">Salvar</button></div><p className="mt-2 font-mono text-xs">Último registro: {painRecords[0] ? `${painRecords[0].region} (${painRecords[0].intensity}/10)` : 'nenhum'}</p></article><article className="rounded-2xl border border-brand-light/20 bg-brand-gray p-4"><h3 className="font-display text-2xl">Cafeína</h3><div className="mt-2 flex gap-2"><input type="number" value={caffeineMg} onChange={e => setCaffeineMg(Number(e.target.value))} className="w-24 bg-brand-dark p-2"/><input type="time" value={caffeineTime} onChange={e => setCaffeineTime(e.target.value)} className="bg-brand-dark p-2"/></div><p className="mt-2 font-mono text-xs">{estimateCaffeineWindow(caffeineMg)}</p>{isNearBedtime(caffeineTime) && <p className="font-mono text-xs text-brand-magenta">Atenção: consumo próximo da janela de sono.</p>}</article></section>;
}
