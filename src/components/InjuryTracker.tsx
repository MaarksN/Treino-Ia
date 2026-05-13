import React, { useState } from 'react';
import { AlertTriangle, Check, Plus } from 'lucide-react';
import { InjuryRecord, SymptomRecord } from '../types';

const INJURY_KEY = '@TreinoApp:injuries';
const SYMPTOM_KEY = '@TreinoApp:symptoms';
const REGIONS = ['Ombro', 'Cotovelo', 'Punho', 'Lombar', 'Joelho', 'Tornozelo', 'Quadril', 'Pescoço', 'Outros'];

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function InjuryTracker() {
  const [injuries, setInjuries] = useState<InjuryRecord[]>(() => loadJSON<InjuryRecord[]>(INJURY_KEY, []));
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>(() => loadJSON<SymptomRecord[]>(SYMPTOM_KEY, []));
  const [tab, setTab] = useState<'lesoes' | 'sintomas'>('lesoes');
  const [newInjury, setNewInjury] = useState<Partial<InjuryRecord>>({ severity: 'leve' });
  const [newSymptom, setNewSymptom] = useState<Partial<SymptomRecord>>({ intensity: 5 });

  const addInjury = () => {
    if (!newInjury.region || !newInjury.description) return;

    const injury: InjuryRecord = {
      id: crypto.randomUUID(),
      region: newInjury.region,
      description: newInjury.description,
      severity: newInjury.severity || 'leve',
      startDate: new Date().toISOString().slice(0, 10),
      notes: newInjury.notes,
    };
    const updated = [...injuries, injury];
    setInjuries(updated);
    saveJSON(INJURY_KEY, updated);
    setNewInjury({ severity: 'leve' });
  };

  const resolveInjury = (id: string) => {
    const updated = injuries.map(injury =>
      injury.id === id
        ? { ...injury, resolved: true, resolvedDate: new Date().toISOString().slice(0, 10) }
        : injury
    );
    setInjuries(updated);
    saveJSON(INJURY_KEY, updated);
  };

  const addSymptom = () => {
    if (!newSymptom.region || !newSymptom.symptom) return;

    const symptom: SymptomRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      region: newSymptom.region,
      symptom: newSymptom.symptom,
      intensity: newSymptom.intensity || 5,
    };
    const updated = [...symptoms, symptom];
    setSymptoms(updated);
    saveJSON(SYMPTOM_KEY, updated);
    setNewSymptom({ intensity: 5 });
  };

  const severityColor = {
    leve: 'text-green-400',
    moderada: 'text-orange-400',
    grave: 'text-red-400',
  };

  const unresolvedInjuries = injuries.filter(injury => !injury.resolved);

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-brand-magenta" />
          <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Saúde e restrições</h3>
        </div>
        <div className="flex gap-2">
          {(['lesoes', 'sintomas'] as const).map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`px-3 py-2 text-xs font-bold border-2 uppercase tracking-widest transition-colors ${
                tab === item
                  ? 'bg-brand-neon text-brand-dark border-brand-neon'
                  : 'bg-brand-dark text-brand-muted border-brand-light/10 hover:text-brand-light'
              }`}
            >
              {item === 'lesoes' ? 'Lesões' : 'Sintomas'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'lesoes' && (
        <>
          <div className="space-y-3 mb-5 p-4 bg-brand-dark border-2 border-brand-light/10">
            <p className="text-sm font-bold text-brand-light uppercase">Registrar lesão</p>
            <select
              value={newInjury.region || ''}
              onChange={event => setNewInjury(current => ({ ...current, region: event.target.value }))}
              className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon"
            >
              <option value="">Região</option>
              {REGIONS.map(region => <option key={region}>{region}</option>)}
            </select>
            <input
              placeholder="Descrição da lesão"
              value={newInjury.description || ''}
              onChange={event => setNewInjury(current => ({ ...current, description: event.target.value }))}
              className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon"
            />
            <select
              value={newInjury.severity}
              onChange={event => setNewInjury(current => ({ ...current, severity: event.target.value as InjuryRecord['severity'] }))}
              className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon"
            >
              <option value="leve">Leve</option>
              <option value="moderada">Moderada</option>
              <option value="grave">Grave</option>
            </select>
            <button onClick={addInjury} type="button" className="inline-flex items-center gap-2 bg-brand-neon text-brand-dark px-4 py-2 border-brutal text-sm font-bold uppercase">
              <Plus size={14} /> Registrar
            </button>
          </div>

          <div className="space-y-2">
            {unresolvedInjuries.map(injury => (
              <div key={injury.id} className="flex items-start justify-between gap-3 p-3 bg-brand-dark border-2 border-brand-light/10">
                <div>
                  <p className="text-brand-light font-semibold text-sm">{injury.region}</p>
                  <p className="text-brand-muted text-xs">{injury.description}</p>
                  <span className={`text-xs font-bold ${severityColor[injury.severity]}`}>{injury.severity}</span>
                  <span className="text-brand-light/30 text-xs ml-2">desde {injury.startDate}</span>
                </div>
                <button onClick={() => resolveInjury(injury.id)} type="button" title="Marcar como resolvida" className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                  <Check size={14} />
                </button>
              </div>
            ))}
            {unresolvedInjuries.length === 0 && <p className="text-brand-muted text-sm">Nenhuma lesão ativa registrada.</p>}
          </div>
        </>
      )}

      {tab === 'sintomas' && (
        <>
          <div className="space-y-3 mb-5 p-4 bg-brand-dark border-2 border-brand-light/10">
            <p className="text-sm font-bold text-brand-light uppercase">Registrar sintoma</p>
            <select
              value={newSymptom.region || ''}
              onChange={event => setNewSymptom(current => ({ ...current, region: event.target.value }))}
              className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon"
            >
              <option value="">Região</option>
              {REGIONS.map(region => <option key={region}>{region}</option>)}
            </select>
            <input
              placeholder="Sintoma"
              value={newSymptom.symptom || ''}
              onChange={event => setNewSymptom(current => ({ ...current, symptom: event.target.value }))}
              className="w-full bg-brand-gray border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon"
            />
            <label className="text-xs text-brand-muted">
              Intensidade: {newSymptom.intensity}
              <input
                type="range"
                min={1}
                max={10}
                value={newSymptom.intensity}
                onChange={event => setNewSymptom(current => ({ ...current, intensity: Number(event.target.value) }))}
                className="mt-2 w-full accent-red-500"
              />
            </label>
            <button onClick={addSymptom} type="button" className="inline-flex items-center gap-2 bg-brand-neon text-brand-dark px-4 py-2 border-brutal text-sm font-bold uppercase">
              <Plus size={14} /> Registrar
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...symptoms].reverse().map(symptom => (
              <div key={symptom.id} className="p-3 bg-brand-dark border-2 border-brand-light/10">
                <div className="flex justify-between gap-3">
                  <p className="text-brand-light text-sm font-semibold">{symptom.region} - {symptom.symptom}</p>
                  <span className={`text-xs font-bold ${symptom.intensity >= 7 ? 'text-red-400' : symptom.intensity >= 4 ? 'text-orange-400' : 'text-green-400'}`}>
                    {symptom.intensity}/10
                  </span>
                </div>
                <p className="text-brand-light/30 text-xs mt-0.5">{symptom.date}</p>
              </div>
            ))}
            {symptoms.length === 0 && <p className="text-brand-muted text-sm">Sem sintomas registrados.</p>}
          </div>
        </>
      )}
    </div>
  );
}
