import React, { useState } from 'react';
import { AlertTriangle, Lightbulb, RefreshCw, TrendingUp } from 'lucide-react';
import { AutoAdjustSuggestion, DailyCheckin, UserProfile, WorkoutHistoryEntry, WorkoutPlan } from '../types';
import { analyzeStagnation, generatePlanAdjustments } from '../services/aiCoachService';

interface Props {
  plan: WorkoutPlan;
  history: WorkoutHistoryEntry[];
  checkins: DailyCheckin[];
  profile: UserProfile;
  onApplyAdjustment?: (suggestion: AutoAdjustSuggestion) => void;
}

const TYPE_CONFIG: Record<AutoAdjustSuggestion['type'], { icon: React.ReactNode; color: string }> = {
  volume_reduction: { icon: <TrendingUp size={16} />, color: 'text-orange-400' },
  intensity_increase: { icon: <TrendingUp size={16} />, color: 'text-brand-neon' },
  deload: { icon: <RefreshCw size={16} />, color: 'text-blue-400' },
  frequency_change: { icon: <RefreshCw size={16} />, color: 'text-purple-400' },
  exercise_swap: { icon: <Lightbulb size={16} />, color: 'text-yellow-400' },
};

export function PlanAutoAdjust({ plan, history, checkins, profile, onApplyAdjustment }: Props) {
  const [suggestions, setSuggestions] = useState<AutoAdjustSuggestion[]>([]);
  const [assessment, setAssessment] = useState('');
  const [priority, setPriority] = useState('');
  const [stagnation, setStagnation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setError('');

    try {
      const [adjustments, stagnationAnalysis] = await Promise.all([
        generatePlanAdjustments(plan, history, checkins, profile),
        analyzeStagnation(history, profile),
      ]);
      setSuggestions(adjustments.suggestions || []);
      setAssessment(adjustments.overallAssessment || '');
      setPriority(adjustments.priorityLevel || '');
      setStagnation(stagnationAnalysis);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível analisar o plano agora.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Ajuste Inteligente de Plano</h3>
        <Lightbulb size={20} className="text-brand-neon" />
      </div>

      <button
        type="button"
        onClick={analyze}
        disabled={loading}
        className="w-full bg-brand-neon text-brand-dark font-bold py-3 rounded-xl mb-4 disabled:opacity-50"
      >
        {loading ? 'Analisando...' : 'Analisar e sugerir ajustes'}
      </button>

      {error && (
        <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/5 mb-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {assessment && (
        <div className={`p-3 rounded-xl border mb-4 ${
          priority.toLowerCase() === 'alta' ? 'border-red-500/30 bg-red-500/5'
            : priority.toLowerCase() === 'média' || priority.toLowerCase() === 'media' ? 'border-orange-500/30 bg-orange-500/5'
              : 'border-green-500/30 bg-green-500/5'
        }`}
        >
          <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">
            Avaliação geral — prioridade <strong>{priority || 'baixa'}</strong>
          </p>
          <p className="text-white text-sm">{assessment}</p>
        </div>
      )}

      {stagnation && (
        <div className="p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-yellow-400" />
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Possível estagnação detectada</p>
          </div>
          <p className="text-white/80 text-sm whitespace-pre-wrap">{stagnation}</p>
        </div>
      )}

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const config = TYPE_CONFIG[suggestion.type] || TYPE_CONFIG.exercise_swap;
          return (
            <div key={`${suggestion.title}-${index}`} className="p-4 bg-brand-dark rounded-xl border border-white/10">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={config.color}>{config.icon}</span>
                  <p className="text-white font-semibold text-sm">{suggestion.title}</p>
                </div>
                {onApplyAdjustment && (
                  <button
                    type="button"
                    onClick={() => onApplyAdjustment(suggestion)}
                    className="text-xs text-brand-neon border border-brand-neon/30 px-2 py-1 rounded-full hover:bg-brand-neon/10 transition-all shrink-0"
                  >
                    Aplicar
                  </button>
                )}
              </div>
              <p className="text-brand-muted text-xs mb-2">{suggestion.description}</p>
              {suggestion.affectedDay && <p className="text-blue-400 text-xs">Dia: {suggestion.affectedDay}</p>}
              {suggestion.affectedExercise && <p className="text-orange-400 text-xs">Exercício: {suggestion.affectedExercise}</p>}
              <p className="text-white/60 text-xs mt-1 italic">→ {suggestion.action}</p>
            </div>
          );
        })}
        {suggestions.length === 0 && !loading && assessment === '' && !error && (
          <p className="text-brand-muted text-sm text-center py-4">Clique em analisar para receber sugestões.</p>
        )}
      </div>
    </div>
  );
}
