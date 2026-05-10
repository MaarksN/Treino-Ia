import React, { useMemo, useState } from 'react';
import { UserProfile, WorkoutSession } from '../types';
import { detectRiskOfAbandonment, generateWeeklyAiInsights } from '../services/aiPersonalizationService';
import { generateLocalWeeklyInsights } from '../services/insightsService';

interface Props {
  profile: UserProfile;
  sessions: WorkoutSession[];
}

export function WeeklyInsightsCard({ profile, sessions }: Props) {
  const [insights, setInsights] = useState('');
  const [risk, setRisk] = useState('');
  const [loading, setLoading] = useState(false);
  const localInsights = useMemo(() => generateLocalWeeklyInsights(sessions), [sessions]);

  async function handleGenerate() {
    setLoading(true);
    try {
      const [weekly, abandonment] = await Promise.all([
        generateWeeklyAiInsights(profile, sessions),
        detectRiskOfAbandonment(profile, sessions),
      ]);

      setInsights(weekly);
      setRisk(abandonment);
    } catch {
      setInsights('Não consegui gerar os insights agora. Verifique a chave Gemini e tente novamente.');
      setRisk('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Insights da semana</h3>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="bg-brand-neon text-brand-dark px-4 py-2 border-brutal font-black uppercase tracking-widest text-xs disabled:opacity-50"
        >
          Gerar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {localInsights.map(insight => (
          <div
            key={insight.title}
            className={`border-l-2 pl-3 text-xs font-mono ${
              insight.severity === 'critical'
                ? 'border-brand-magenta text-brand-magenta'
                : insight.severity === 'warning'
                  ? 'border-yellow-300 text-yellow-300'
                  : 'border-brand-neon text-brand-light/80'
            }`}
          >
            <strong className="block uppercase">{insight.title}</strong>
            {insight.description}
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-brand-muted text-sm font-mono">Analisando...</p>
      ) : (
        <div className="space-y-4">
          <div className="text-sm whitespace-pre-wrap text-brand-light/80 font-mono">
            {insights || 'Sem relatório IA ainda.'}
          </div>
          <div className="text-sm whitespace-pre-wrap text-yellow-300 font-mono">{risk || 'Sem risco IA calculado.'}</div>
        </div>
      )}
    </div>
  );
}
