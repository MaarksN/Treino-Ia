import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Loader2, Plus } from 'lucide-react';
import { InjuryRecord, SymptomRecord } from '../types';
import { DataMode } from '../types/trainingExecution';
import {
  createInjuryRecord,
  createSymptomRecord,
  dataModeLabel,
  loadInjuryRecords,
  loadSymptomRecords,
  resolveInjuryRecord,
} from '../services/healthService';

const REGIONS = ['Ombro', 'Cotovelo', 'Punho', 'Lombar', 'Joelho', 'Tornozelo', 'Quadril', 'Pescoço', 'Outros'];

export function InjuryTracker() {
  const [injuries, setInjuries] = useState<InjuryRecord[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>([]);
  const [tab, setTab] = useState<'lesoes' | 'sintomas'>('lesoes');
  const [newInjury, setNewInjury] = useState<Partial<InjuryRecord>>({ severity: 'leve' });
  const [newSymptom, setNewSymptom] = useState<Partial<SymptomRecord>>({ intensity: 5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dataMode, setDataMode] = useState<DataMode | null>(null);
  const [warning, setWarning] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [injuryResult, symptomResult] = await Promise.all([
        loadInjuryRecords(),
        loadSymptomRecords(),
      ]);
      setInjuries(injuryResult.data);
      setSymptoms(symptomResult.data);
      setDataMode(injuryResult.dataMode);
      setWarning(injuryResult.warning || symptomResult.warning || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar saúde e restrições.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const addInjury = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await createInjuryRecord({
        ...newInjury,
        startDate: new Date().toISOString().slice(0, 10),
      });
      setInjuries(current => [result.data, ...current]);
      setDataMode(result.dataMode);
      setWarning(result.warning || '');
      setNewInjury({ severity: 'leve' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao registrar lesão.');
    } finally {
      setSaving(false);
    }
  };

  const resolveInjury = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      const result = await resolveInjuryRecord(id);
      setInjuries(result.data);
      setDataMode(result.dataMode);
      setWarning(result.warning || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao resolver lesão.');
    } finally {
      setSaving(false);
    }
  };

  const addSymptom = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await createSymptomRecord({
        ...newSymptom,
        date: new Date().toISOString().slice(0, 10),
      });
      setSymptoms(current => [result.data, ...current]);
      setDataMode(result.dataMode);
      setWarning(result.warning || '');
      setNewSymptom({ intensity: 5 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao registrar sintoma.');
    } finally {
      setSaving(false);
    }
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
        {dataMode && (
          <span className={`border-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
            dataMode === 'supabase'
              ? 'border-brand-neon/40 bg-brand-neon/10 text-brand-neon'
              : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
          }`}>
            dataMode: {dataModeLabel(dataMode)}
          </span>
        )}
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

      {warning && <p className="mb-4 text-xs text-yellow-300 bg-yellow-500/10 border-2 border-yellow-500/30 p-3">{warning}</p>}
      {error && <p className="mb-4 text-xs text-red-300 bg-red-500/10 border-2 border-red-500/30 p-3">{error}</p>}
      {loading && (
        <div className="flex items-center gap-2 text-brand-muted text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Carregando registros de saúde...
        </div>
      )}

      {!loading && tab === 'lesoes' && (
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
            <button onClick={addInjury} disabled={saving} type="button" className="inline-flex items-center gap-2 bg-brand-neon text-brand-dark px-4 py-2 border-brutal text-sm font-bold uppercase disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Registrar
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
                <button onClick={() => resolveInjury(injury.id)} disabled={saving} type="button" title="Marcar como resolvida" className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                </button>
              </div>
            ))}
            {unresolvedInjuries.length === 0 && <p className="text-brand-muted text-sm">Nenhuma lesão ativa registrada.</p>}
          </div>
        </>
      )}

      {!loading && tab === 'sintomas' && (
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
            <button onClick={addSymptom} disabled={saving} type="button" className="inline-flex items-center gap-2 bg-brand-neon text-brand-dark px-4 py-2 border-brutal text-sm font-bold uppercase disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Registrar
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
