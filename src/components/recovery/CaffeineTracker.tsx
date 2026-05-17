import { useMemo, useState } from 'react';
import { CAFFEINE_PRESETS, estimateCaffeineImpact, getCaffeineEntries, saveCaffeineEntry } from '../../services/recovery/caffeineImpactService';

export function CaffeineTracker() {
  const [entries, setEntries] = useState(getCaffeineEntries());
  const [manualMg, setManualMg] = useState('');
  const impact = useMemo(() => estimateCaffeineImpact(entries), [entries]);

  return <article className="rounded-2xl border-2 border-brand-light/20 bg-brand-gray p-4"><h3 className="font-display text-2xl">Cafeína</h3><div className="mt-2 flex flex-wrap gap-2">{Object.entries(CAFFEINE_PRESETS).map(([name, mg]) => <button key={name} className="rounded border px-2 py-1 text-xs" onClick={() => setEntries(saveCaffeineEntry(mg))}>{name}</button>)}</div><div className="mt-2"><input value={manualMg} onChange={e => setManualMg(e.target.value)} placeholder="mg" className="w-24 rounded bg-brand-dark px-2 py-1" /><button className="ml-2 rounded border px-2 py-1" onClick={() => { setEntries(saveCaffeineEntry(manualMg)); setManualMg(''); }}>Registrar</button></div><p className="mt-2 text-sm">Total: {impact.totalMg} mg</p><p className="text-xs text-brand-light/80">{impact.message}</p></article>;
}
