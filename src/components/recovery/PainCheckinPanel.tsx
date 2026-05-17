import { useState } from 'react';
import {
  clampPainLevel,
  getPainCheckin,
  PAIN_REGIONS,
  savePainCheckin,
  type PainMap,
  type PainRegion,
} from '../../services/recovery/painCheckinService';
import { InlineNotice } from '../ui/InlineNotice';

const REGION_LABELS: Record<PainRegion, string> = {
  ombros: '🦴 Ombros',
  costas: '🔙 Costas',
  joelhos: '🦵 Joelhos',
  quadril: '🦴 Quadril',
  cotovelos: '💪 Cotovelos',
  punhos: '✊ Punhos',
  tornozelos: '🦶 Tornozelos',
};

function getPainColor(level: number): string {
  if (level === 0) return 'text-brand-muted';
  if (level <= 3) return 'text-brand-neon';
  if (level <= 6) return 'text-brand-gold';
  return 'text-brand-magenta';
}

export function PainCheckinPanel() {
  const existing = getPainCheckin();
  const [pain, setPain] = useState<PainMap>(existing.pain);
  const [notes, setNotes] = useState(existing.notes);
  const [saved, setSaved] = useState(false);

  const hasAnyPain = Object.values(pain).some(v => v > 0);
  const maxPain = Math.max(...Object.values(pain));

  const handleSave = () => {
    const sanitizedNotes = typeof notes === 'string' ? notes.trim().slice(0, 240) : '';
    savePainCheckin({ pain, notes: sanitizedNotes });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePainChange = (region: PainRegion, value: number) => {
    setPain(prev => ({ ...prev, [region]: clampPainLevel(value) }));
    setSaved(false);
  };

  return (
    <article
      className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6"
      aria-labelledby="pain-checkin-title"
    >
      <h3 id="pain-checkin-title" className="font-display text-3xl uppercase text-brand-light">
        Check-in de dor
      </h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">
        Registre desconforto por região corporal. Intensidade de 0 (nenhuma) a 10 (máxima).
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PAIN_REGIONS.map(region => (
          <label
            key={region}
            className="flex items-center justify-between gap-2 rounded-xl border border-brand-light/10 bg-brand-dark/50 px-3 py-2"
          >
            <span className="font-mono text-sm text-brand-light">{REGION_LABELS[region]}</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={10}
                value={pain[region]}
                onChange={e => handlePainChange(region, Number(e.target.value))}
                className="w-20 accent-brand-neon"
                aria-label={`Dor ${region}: ${pain[region]} de 10`}
              />
              <span className={`w-6 text-center font-mono text-sm font-bold ${getPainColor(pain[region])}`}>
                {pain[region]}
              </span>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <label className="block font-mono text-xs uppercase text-brand-muted" htmlFor="pain-notes">
          Observações (opcional)
        </label>
        <textarea
          id="pain-notes"
          rows={2}
          maxLength={240}
          value={notes}
          onChange={e => { setNotes(e.target.value); setSaved(false); }}
          placeholder="Ex: dor após agachamento pesado ontem..."
          className="mt-1 w-full resize-none rounded-xl border border-brand-light/10 bg-brand-dark px-3 py-2 font-mono text-sm text-brand-light outline-none focus:border-brand-neon"
        />
      </div>

      {hasAnyPain && maxPain >= 6 && (
        <div className="mt-3 rounded-xl border border-brand-magenta/30 bg-brand-magenta/10 p-3">
          <p className="font-mono text-xs text-brand-magenta">
            ⚠️ Dor elevada detectada ({maxPain}/10). Considere reduzir volume ou consultar um profissional de saúde.
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-full border-2 border-brand-neon bg-brand-neon px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-brand-dark transition-colors hover:bg-transparent hover:text-brand-neon focus:outline-none focus:ring-2 focus:ring-brand-neon focus:ring-offset-2 focus:ring-offset-brand-dark"
        >
          Salvar registro
        </button>
        {saved && (
          <span className="font-mono text-xs text-brand-neon" role="status" aria-live="polite">
            ✓ Salvo localmente
          </span>
        )}
      </div>

      {!hasAnyPain && (
        <p className="mt-3 font-mono text-xs text-brand-muted">
          Nenhuma dor registrada. Ajuste os controles acima se sentir desconforto.
        </p>
      )}

      <InlineNotice type="info" title="Aviso importante">
        Este check-in é uma ferramenta de automonitoramento. Não constitui diagnóstico médico.
        Se a dor persistir ou for intensa, procure um profissional de saúde.
      </InlineNotice>
    </article>
  );
}
