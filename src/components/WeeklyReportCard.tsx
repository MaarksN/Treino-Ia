import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { WorkoutHistoryRecord, WorkoutPlan } from '../types';
import { generateWeeklyReport } from '../services/geminiService';

interface Props {
  plans: WorkoutPlan[];
  workoutHistory?: WorkoutHistoryRecord[];
}

export function WeeklyReportCard({ plans, workoutHistory = [] }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      setText(await generateWeeklyReport(plans, workoutHistory));
    } catch {
      setText('Não consegui gerar o relatório agora. Verifique a chave Gemini e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-gray border-2 border-brand-light/10 p-5 shadow-brutal-light h-full">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="text-brand-neon" size={18} />
          <h3 className="font-display text-2xl uppercase tracking-widest text-brand-light">Relatório Semanal</h3>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="bg-brand-neon text-brand-dark px-4 py-2 border-brutal font-black uppercase tracking-widest text-xs disabled:opacity-50"
        >
          Gerar
        </button>
      </div>

      <div className="text-sm text-brand-light/80 whitespace-pre-wrap font-mono leading-relaxed max-h-80 overflow-y-auto">
        {loading ? 'Gerando relatório...' : text || 'Clique em gerar para receber a análise da semana.'}
      </div>
    </div>
  );
}
