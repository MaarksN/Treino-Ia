import React, { useState } from 'react';
import { Activity, Dumbbell, Gauge, Move, RefreshCw } from 'lucide-react';
import { DailyCheckin, UserProfile, WorkoutPlan } from '../types';
import { calculateReadiness } from '../utils/readinessUtils';
import {
  generateActiveRestRecommendation,
  generateIntensityAdjustment,
  generateMobilityRecommendation,
  generatePostWorkoutProtocol,
  generateVolumeReductionAdvice,
} from '../services/recoveryService';

interface Props {
  plan: WorkoutPlan;
  checkin: DailyCheckin | null;
  allCheckins: DailyCheckin[];
  profile: UserProfile;
}

type RecoveryTab = 'descanso' | 'mobilidade' | 'pos-treino' | 'volume' | 'intensidade';

const TABS: Array<{ id: RecoveryTab; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'descanso', label: 'Descanso ativo', Icon: Activity },
  { id: 'mobilidade', label: 'Mobilidade', Icon: Move },
  { id: 'pos-treino', label: 'Pós-treino', Icon: Dumbbell },
  { id: 'volume', label: 'Volume', Icon: RefreshCw },
  { id: 'intensidade', label: 'Intensidade', Icon: Gauge },
];

export function RecoveryProtocol({ plan, checkin, allCheckins, profile }: Props) {
  const [activeTab, setActiveTab] = useState<RecoveryTab>('descanso');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!checkin) return;

    setLoading(true);
    try {
      const readiness = calculateReadiness(checkin);
      let text = '';

      if (activeTab === 'descanso') text = await generateActiveRestRecommendation(checkin);
      else if (activeTab === 'mobilidade') text = await generateMobilityRecommendation(checkin.sorenessMap);
      else if (activeTab === 'pos-treino') text = await generatePostWorkoutProtocol(plan, checkin);
      else if (activeTab === 'volume') text = await generateVolumeReductionAdvice(allCheckins, profile);
      else if (activeTab === 'intensidade') text = await generateIntensityAdjustment(plan, readiness);

      setResult(text);
    } catch {
      setResult('Não consegui gerar a recomendação agora. Verifique a chave Gemini e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light mb-4">Protocolo de recuperação</h3>

      <div className="flex gap-2 flex-wrap mb-4">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setActiveTab(id);
              setResult('');
            }}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-bold border-2 uppercase tracking-widest transition-colors ${
              activeTab === id
                ? 'bg-brand-neon text-brand-dark border-brand-neon'
                : 'bg-brand-dark text-brand-muted border-brand-light/10 hover:text-brand-light'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {!checkin ? (
        <p className="text-brand-muted text-sm">Faça o check-in diário primeiro.</p>
      ) : (
        <>
          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="w-full bg-brand-neon text-brand-dark font-black py-3 border-brutal uppercase tracking-widest disabled:opacity-60"
          >
            {loading ? 'Gerando...' : 'Gerar recomendação'}
          </button>
          <div className="mt-4 text-sm text-brand-light/80 whitespace-pre-wrap font-mono">
            {result || 'Escolha uma aba e gere uma recomendação personalizada.'}
          </div>
        </>
      )}
    </div>
  );
}
