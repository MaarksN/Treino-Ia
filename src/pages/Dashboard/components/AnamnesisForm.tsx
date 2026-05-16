import React, { FormEvent } from 'react';
import { Save } from 'lucide-react';
import { UserProfile } from '../../../services/database';

const fieldClass = 'mt-2 w-full rounded-[22px] border-2 border-brand-light/15 bg-brand-gray px-4 py-3 font-mono text-sm text-brand-light outline-none transition-colors placeholder:text-brand-muted focus:border-brand-neon';
const labelClass = 'block font-mono text-[11px] uppercase tracking-[0.25em] text-brand-muted';

const levelOptions: Array<{ value: UserProfile['level']; label: string; detail: string }> = [
  { value: 'iniciante', label: 'Iniciante', detail: 'Base técnica' },
  { value: 'intermediario', label: 'Intermediário', detail: 'Carga progressiva' },
  { value: 'avancado', label: 'Avançado', detail: 'Periodização' },
];

const goalOptions = ['Hipertrofia', 'Força', 'Definição', 'Condicionamento'];

const equipmentOptions = [
  'Academia completa',
  'Casa com halteres',
  'Peso corporal',
  'Elásticos',
  'Academia do prédio',
];

interface AnamnesisFormProps {
  profile: UserProfile;
  saving: boolean;
  onChange: (profile: UserProfile) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AnamnesisForm({
  profile,
  saving,
  onChange,
  onSubmit,
}: AnamnesisFormProps) {
  return (
    <form onSubmit={onSubmit} className="mb-8 rounded-[28px] border-4 border-brand-neon bg-brand-gray p-6 shadow-brutal-neon md:p-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">Anamnese</p>
          <h2 className="font-display text-5xl uppercase text-brand-light">Perfil do atleta</h2>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-[24px] border-2 border-brand-neon bg-brand-neon px-6 py-3 font-mono text-xs uppercase tracking-widest text-brand-dark disabled:opacity-60"
        >
          <Save className="mr-2 inline h-4 w-4" />
          {saving ? 'Salvando' : 'Salvar e gerar'}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className={labelClass}>Nome</span>
          <input
            value={profile.name}
            onChange={event => onChange({ ...profile, name: event.target.value })}
            className={fieldClass}
            placeholder="Seu nome"
          />
        </label>

        <label>
          <span className={labelClass}>Objetivo</span>
          <select
            value={profile.goal}
            onChange={event => onChange({ ...profile, goal: event.target.value })}
            className={fieldClass}
          >
            {goalOptions.map(goal => <option key={goal} value={goal}>{goal}</option>)}
          </select>
        </label>

        <div className="md:col-span-2">
          <span className={labelClass}>Nível</span>
          <div className="mt-2 grid gap-3 md:grid-cols-3">
            {levelOptions.map(option => {
              const selected = profile.level === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ ...profile, level: option.value })}
                  className={`rounded-[22px] border-2 p-4 text-left transition-all ${
                    selected
                      ? 'border-brand-neon bg-brand-neon text-brand-dark shadow-brutal-neon'
                      : 'border-brand-light/15 bg-brand-dark text-brand-light hover:border-brand-neon'
                  }`}
                >
                  <span className="block font-display text-3xl uppercase leading-none">{option.label}</span>
                  <span className={`mt-1 block font-mono text-[10px] uppercase tracking-widest ${selected ? 'text-brand-dark/70' : 'text-brand-muted'}`}>
                    {option.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <label>
          <span className={labelClass}>Dias por semana</span>
          <input
            type="number"
            min={1}
            max={6}
            value={profile.daysPerWeek}
            onChange={event => onChange({ ...profile, daysPerWeek: Number(event.target.value) })}
            className={fieldClass}
          />
        </label>

        <label>
          <span className={labelClass}>Tempo por treino (min)</span>
          <input
            type="number"
            min={20}
            max={120}
            value={profile.timePerWorkout}
            onChange={event => onChange({ ...profile, timePerWorkout: Number(event.target.value) })}
            className={fieldClass}
          />
        </label>

        <label>
          <span className={labelClass}>Equipamento disponível</span>
          <select
            value={profile.equipment}
            onChange={event => onChange({ ...profile, equipment: event.target.value })}
            className={fieldClass}
          >
            {equipmentOptions.map(equipment => <option key={equipment} value={equipment}>{equipment}</option>)}
          </select>
        </label>

        <label>
          <span className={labelClass}>Lesões ou limitações</span>
          <input
            value={profile.injuries}
            onChange={event => onChange({ ...profile, injuries: event.target.value })}
            className={fieldClass}
            placeholder="Ex: joelho, ombro, lombar"
          />
        </label>
      </div>
    </form>
  );
}
