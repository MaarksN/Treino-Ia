import { type ChangeEvent, useEffect, useState } from 'react';
import { type EquipmentId, EQUIPMENT_CATALOG, EQUIPMENT_PHOTO_GUARD, generateAdaptation, getSelectedEquipment, saveSelectedEquipment } from '../../services/ai/equipmentReplanService';
import { InlineNotice } from '../ui/InlineNotice';

const LABELS: Record<EquipmentId, string> = {
  halteres: '🏋️ Halteres', barra: '🔩 Barra', banco: '🪑 Banco', elasticos: '🔗 Elásticos',
  maquinas: '⚙️ Máquinas', peso_corporal: '🧍 Peso corporal', kettlebell: '🔔 Kettlebell',
  anilhas: '⚫ Anilhas', bola_suica: '🟡 Bola suíça', corda: '🪢 Corda',
};

export function EquipmentReplanPanel() {
  const [selected, setSelected] = useState<EquipmentId[]>(() => getSelectedEquipment());
  const [photoPreview, setPhotoPreview] = useState<{ name: string; url: string } | null>(null);
  const adaptation = generateAdaptation(selected);

  useEffect(() => {
    return () => {
      if (photoPreview?.url) URL.revokeObjectURL(photoPreview.url);
    };
  }, [photoPreview?.url]);

  const toggle = (id: EquipmentId) => {
    const next = selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id];
    setSelected(saveSelectedEquipment(next));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setPhotoPreview(null);
      return;
    }

    setPhotoPreview({ name: file.name, url: URL.createObjectURL(file) });
  };

  return (
    <article className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6" aria-labelledby="equip-replan-title">
      <h3 id="equip-replan-title" className="font-display text-3xl uppercase text-brand-light">Equipamentos disponíveis</h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">Selecione o que você tem e receba sugestões de adaptação.</p>
      <label className="mt-4 block rounded-2xl border-2 border-dashed border-brand-light/20 bg-brand-dark/30 p-4">
        <span className="block font-mono text-xs font-bold uppercase text-brand-light">Foto do espaço</span>
        <span className="mt-1 block font-mono text-[10px] text-brand-muted">Opcional. A imagem fica apenas como preview local; a adaptação usa a lista manual.</span>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="mt-3 block w-full text-xs text-brand-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand-light/10 file:px-3 file:py-1.5 file:font-mono file:text-xs file:font-bold file:text-brand-light hover:file:bg-brand-light/20"
        />
      </label>
      {photoPreview && (
        <figure className="mt-3 overflow-hidden rounded-2xl border border-brand-light/10 bg-brand-dark/40">
          <img src={photoPreview.url} alt={`Preview da foto de equipamentos: ${photoPreview.name}`} className="h-40 w-full object-cover" />
          <figcaption className="px-3 py-2 font-mono text-[10px] text-brand-muted">{photoPreview.name}</figcaption>
        </figure>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {EQUIPMENT_CATALOG.map(id => (
          <button key={id} type="button" onClick={() => toggle(id)} aria-pressed={selected.includes(id)}
            className={`rounded-full border-2 px-3 py-1.5 font-mono text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-brand-neon ${selected.includes(id) ? 'border-brand-neon bg-brand-neon/10 text-brand-neon' : 'border-brand-light/10 text-brand-muted hover:border-brand-light/20'}`}>
            {LABELS[id]}
          </button>
        ))}
      </div>
      {adaptation.suggestions.length > 0 && (
        <div className="mt-4 space-y-1">
          <p className="font-mono text-xs font-bold uppercase text-brand-neon">Sugestões</p>
          {adaptation.suggestions.map((s, i) => (
            <p key={i} className="flex items-start gap-2 font-mono text-xs text-brand-muted"><span className="text-brand-neon">•</span>{s}</p>
          ))}
        </div>
      )}
      {selected.length > 0 && <p className="mt-2 font-mono text-[10px] text-brand-muted">{adaptation.disclaimer}</p>}
      <InlineNotice type="info" title="Foto apenas como referência">{EQUIPMENT_PHOTO_GUARD}</InlineNotice>
    </article>
  );
}
