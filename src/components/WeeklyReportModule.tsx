import React, { useState, useEffect } from 'react';
import { WorkoutHistoryRecord, WorkoutPlan } from '../types';
import { generateWorkoutHistoryReport } from '../services/geminiService';
import { Sparkles, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';

interface Props {
  plan: WorkoutPlan;
  workoutHistory: WorkoutHistoryRecord[];
  onGenerateNextWeek: () => void;
  onDeload: () => void;
}

export function WeeklyReportModule({ plan, workoutHistory, onGenerateNextWeek, onDeload }: Props) {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchReport = async () => {
      try {
        const text = await generateWorkoutHistoryReport(workoutHistory);
        if (mounted) setReport(text);
      } catch (e) {
        if (mounted) setReport("Erro ao gerar relatório com a IA. Recarregue os sistemas de inteligência.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchReport();
    return () => { mounted = false; };
  }, [workoutHistory]);

  return (
    <div className="mb-12 bg-brand-neon/10 border-2 border-brand-neon p-6 md:p-8 rounded-3xl shadow-brutal-neon relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/10 blur-3xl rounded-full pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        <div className="flex-1">
          <div className="flex items-center mb-6">
            <Sparkles className="w-8 h-8 text-brand-neon mr-3" />
            <h2 className="font-display font-black text-3xl md:text-4xl uppercase tracking-tighter text-brand-light text-shadow-neon">
              Microciclo Concluído!
            </h2>
          </div>
          
          <div className="bg-black/50 border border-brand-neon/30 p-6 rounded-2xl mb-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex gap-2 mb-4">
                  <div className="w-2 h-2 bg-brand-neon rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-brand-neon rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-brand-neon rounded-full animate-bounce delay-200"></div>
                </div>
                <p className="font-mono text-sm uppercase tracking-widest text-brand-neon/80">Processando dados na forja neural...</p>
              </div>
            ) : (
              <div className="font-sans text-brand-light/90 [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-black [&>h1]:text-brand-magenta [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-brand-neon [&>h2]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>li]:mb-1 [&>strong]:text-brand-neon">
                <Markdown>{report || ''}</Markdown>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 md:w-64 flex flex-col gap-4 justify-center">
          <div className="bg-black/30 p-4 rounded-xl border border-white/10 mb-2">
             <h4 className="font-display uppercase text-sm text-brand-muted mb-2 tracking-widest flex items-center">
                <Activity className="w-4 h-4 mr-2" /> Próximos Passos
             </h4>
             <p className="text-xs font-mono opacity-60">
                A IA analisou os sinais de platô e overtraining. Tome sua decisão.
             </p>
          </div>

          <button 
            onClick={onGenerateNextWeek}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-brand-neon text-brand-dark font-black font-display uppercase tracking-widest text-lg shadow-[0_0_15px_rgba(204,255,0,0.4)] hover:bg-white hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] transition-all flex flex-col items-center justify-center disabled:opacity-50"
          >
            <RefreshCw className="w-5 h-5 mb-1" />
            Sobrecarga +
          </button>

          <button 
            onClick={onDeload}
            className="w-full py-4 px-6 bg-brand-dark text-brand-magenta font-black font-display uppercase tracking-widest text-lg border-2 border-brand-magenta/50 hover:bg-brand-magenta hover:text-white transition-colors flex flex-col items-center justify-center shadow-brutal-magenta"
          >
            <AlertTriangle className="w-5 h-5 mb-1" />
            Deload (-20%)
          </button>
        </div>
      </div>
    </div>
  );
}
