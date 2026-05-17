import { useState } from 'react';
import { getPainCheckin, PAIN_REGIONS, savePainCheckin, type PainMap } from '../../services/recovery/painCheckinService';

export function PainCheckinPanel() {
  const existing = getPainCheckin();
  const [pain, setPain] = useState<PainMap>(existing.pain);
  const [saved, setSaved] = useState(false);

  return <article className="rounded-2xl border-2 border-brand-light/20 bg-brand-gray p-4"><h3 className="font-display text-2xl">Check-in de dor</h3><div className="mt-3 grid gap-2">{PAIN_REGIONS.map(region => <label key={region} className="text-sm capitalize">{region}: <input className="ml-2 w-16 rounded bg-brand-dark px-2" type="number" min={0} max={10} value={pain[region]} onChange={e => setPain({ ...pain, [region]: Number(e.target.value) })} /></label>)}</div><button className="mt-3 rounded border px-3 py-1" onClick={() => { savePainCheckin({ pain }); setSaved(true); }}>Salvar dor</button>{saved && <p className="mt-2 text-xs text-brand-neon">Registro salvo localmente.</p>}</article>;
}
