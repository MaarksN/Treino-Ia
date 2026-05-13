import React, { useRef, useState } from 'react';
import { Camera, LineChart as LineChartIcon, Plus, ScanLine } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BodyMetric } from '../types';
import { analyzeBodyPhoto } from '../services/nutritionService';

const BODY_KEY = '@TreinoApp:bodyMetrics';

function loadMetrics(): BodyMetric[] {
  try {
    return JSON.parse(localStorage.getItem(BODY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveMetrics(metrics: BodyMetric[]) {
  localStorage.setItem(BODY_KEY, JSON.stringify(metrics));
}

type BodyTab = 'registro' | 'grafico' | 'fotos' | 'comparador' | 'ia';

export function BodyCompositionTracker() {
  const [metrics, setMetrics] = useState<BodyMetric[]>(() => loadMetrics());
  const [tab, setTab] = useState<BodyTab>('registro');
  const [newMetric, setNewMetric] = useState<Partial<BodyMetric>>({});
  const [aiText, setAiText] = useState('');
  const [loading, setLoading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const persistMetrics = (next: BodyMetric[]) => {
    setMetrics(next);
    saveMetrics(next);
  };

  const handleAddMetric = () => {
    const metric: BodyMetric = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      weight: newMetric.weight,
      bodyFatPercent: newMetric.bodyFatPercent,
      chest: newMetric.chest,
      waist: newMetric.waist,
      hip: newMetric.hip,
      arm: newMetric.arm,
      thigh: newMetric.thigh,
    };
    persistMetrics([...metrics, metric]);
    setNewMetric({});
  };

  const handlePhotoUpload = (file: File, isComparison = false) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setLoading(true);

      try {
        const previousBase64 = isComparison ? metrics.filter(metric => metric.photoBase64).slice(-1)[0]?.photoBase64 || null : null;
        const analysis = await analyzeBodyPhoto(base64, previousBase64, file.type);

        if (!isComparison) {
          const lastMetric = metrics[metrics.length - 1];
          if (lastMetric) {
            persistMetrics(metrics.map(metric => metric.id === lastMetric.id ? { ...metric, photoBase64: base64, aiAnalysis: analysis } : metric));
          } else {
            persistMetrics([{
              id: crypto.randomUUID(),
              date: new Date().toISOString().slice(0, 10),
              photoBase64: base64,
              aiAnalysis: analysis,
            }]);
          }
        }

        setAiText(analysis);
      } catch {
        setAiText('Não consegui analisar a foto agora.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const tabs: Array<{ id: BodyTab; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'registro', label: 'Medidas', Icon: Plus },
    { id: 'grafico', label: 'Gráfico', Icon: LineChartIcon },
    { id: 'fotos', label: 'Fotos', Icon: Camera },
    { id: 'comparador', label: 'Comparar', Icon: ScanLine },
    { id: 'ia', label: 'IA', Icon: ScanLine },
  ];

  const weightChartData = metrics.filter(metric => metric.weight).map(metric => ({ date: metric.date, peso: metric.weight }));

  const Field = ({ label, field }: { label: string; field: keyof BodyMetric }) => (
    <label className="text-xs text-brand-muted">
      {label}
      <input
        type="number"
        step="0.1"
        value={(newMetric[field] as number) || ''}
        onChange={event => setNewMetric(current => ({ ...current, [field]: Number(event.target.value) }))}
        className="mt-1 w-full bg-brand-dark border-2 border-brand-light/10 px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-neon"
      />
    </label>
  );

  const latest = metrics[metrics.length - 1];

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light mb-4">Composição corporal</h3>

      <div className="flex gap-2 flex-wrap mb-5">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setAiText('');
            }}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-bold border-2 uppercase tracking-widest transition-colors ${
              tab === id
                ? 'bg-brand-neon text-brand-dark border-brand-neon'
                : 'bg-brand-dark text-brand-muted border-brand-light/10 hover:text-brand-light'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'registro' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Field label="Peso (kg)" field="weight" />
            <Field label="% gordura" field="bodyFatPercent" />
            <Field label="Peito (cm)" field="chest" />
            <Field label="Cintura (cm)" field="waist" />
            <Field label="Quadril (cm)" field="hip" />
            <Field label="Braço (cm)" field="arm" />
            <Field label="Coxa (cm)" field="thigh" />
          </div>
          <button onClick={handleAddMetric} type="button" className="inline-flex items-center gap-2 bg-brand-neon text-brand-dark font-bold px-5 py-3 border-brutal uppercase">
            <Plus size={16} /> Salvar medidas
          </button>

          {latest && (
            <div className="p-3 bg-brand-dark border-2 border-brand-light/10">
              <p className="text-xs text-brand-muted mb-2">Última medição - {latest.date}</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {latest.weight && <span className="text-brand-light">{latest.weight}kg</span>}
                {latest.bodyFatPercent && <span className="text-orange-400">{latest.bodyFatPercent}% gordura</span>}
                {latest.waist && <span className="text-blue-400">{latest.waist}cm cintura</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'grafico' && (
        <div>
          {weightChartData.length >= 2 ? (
            <div className="h-64">
              <p className="text-xs text-brand-muted mb-2">Evolução do peso</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#9ca9bb" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca9bb" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="peso" stroke="#a3e635" strokeWidth={3} dot={{ fill: '#a3e635', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-brand-muted text-sm">Registre pelo menos 2 medições para ver o gráfico.</p>
          )}
        </div>
      )}

      {tab === 'fotos' && (
        <div className="space-y-4">
          <input ref={photoRef} type="file" accept="image/*" onChange={event => event.target.files?.[0] && handlePhotoUpload(event.target.files[0])} className="hidden" />
          <button onClick={() => photoRef.current?.click()} type="button" className="w-full inline-flex items-center justify-center gap-2 bg-brand-dark border-2 border-brand-light/20 text-brand-light font-bold py-4 hover:border-brand-neon transition-colors">
            <Camera size={20} /> Adicionar foto de progresso
          </button>
          {loading && <p className="text-brand-muted text-sm">Analisando...</p>}
          <div className="space-y-3">
            {metrics.filter(metric => metric.photoBase64).map(metric => (
              <div key={metric.id} className="p-3 bg-brand-dark border-2 border-brand-light/10">
                <p className="text-xs text-brand-muted mb-2">{metric.date}</p>
                <img src={`data:image/jpeg;base64,${metric.photoBase64}`} alt="Progresso corporal" className="w-full max-h-48 object-cover" />
                {metric.aiAnalysis && <p className="text-xs text-brand-light/60 mt-2">{metric.aiAnalysis}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'comparador' && (
        <div className="space-y-4">
          <p className="text-brand-muted text-sm">Compare a foto atual com a foto anterior registrada.</p>
          <input type="file" accept="image/*" onChange={event => event.target.files?.[0] && handlePhotoUpload(event.target.files[0], true)} className="hidden" id="compare-input" />
          <label htmlFor="compare-input" className="block w-full text-center bg-brand-neon text-brand-dark font-black py-4 border-brutal cursor-pointer uppercase tracking-widest">
            Enviar foto atual
          </label>
          {loading && <p className="text-brand-muted text-sm">Comparando...</p>}
          {aiText && <div className="text-sm text-brand-light/80 whitespace-pre-wrap bg-brand-dark p-4 border-2 border-brand-light/10 font-mono">{aiText}</div>}
        </div>
      )}

      {tab === 'ia' && (
        <div className="space-y-4">
          <p className="text-brand-muted text-sm">Acompanhe análises visuais e metas de recomposição a partir das fotos registradas.</p>
          {metrics.some(metric => metric.aiAnalysis) ? (
            <div className="space-y-3">
              {metrics.filter(metric => metric.aiAnalysis).map(metric => (
                <div key={metric.id} className="p-3 bg-brand-dark border-2 border-brand-light/10">
                  <p className="text-xs text-brand-muted mb-1">{metric.date}</p>
                  <p className="text-sm text-brand-light/80">{metric.aiAnalysis}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-brand-muted text-sm">Adicione fotos de progresso para gerar análises de IA.</p>
          )}
        </div>
      )}
    </div>
  );
}
