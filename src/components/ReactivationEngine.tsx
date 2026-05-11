import React, { useState } from 'react';
import { StreakData } from '../types';
import { generateGeminiContent } from '../services/geminiProxyClient';
import { getDaysSinceLastWorkout } from '../utils/streakUtils';
import {
  createAlternativeWorkoutSuggestion,
  createWorkoutCalendarItem,
} from '../services/retentionService';

interface Props {
  streak: StreakData;
  userName?: string;
  goal?: string;
}

const MOTIVATIONAL_MESSAGES = [
  { days: 0, message: 'Você está em ritmo forte. Continue protegendo a consistência.', level: 'fire' },
  { days: 1, message: 'Um dia de pausa pode ser recuperação. Mantenha o próximo treino no radar.', level: 'ok' },
  { days: 2, message: 'Dois dias sem treino. Um bloco curto hoje já segura o embalo.', level: 'warning' },
  { days: 3, message: 'Três dias sem treinar. Seu streak está pedindo uma ação simples hoje.', level: 'alert' },
  { days: 5, message: 'Cinco dias sem treino. Recomece pequeno e recupere tração.', level: 'danger' },
  { days: 7, message: 'Uma semana parado. Qualquer sessão bem feita hoje já muda a semana.', level: 'danger' },
  { days: 14, message: 'Duas semanas fora. Voltar com inteligência vale mais que voltar pesado.', level: 'comeback' },
];

export function ReactivationEngine({ streak, userName = 'Atleta', goal = 'hipertrofia' }: Props) {
  const daysSince = getDaysSinceLastWorkout(streak);
  const safeDays = Number.isFinite(daysSince) ? daysSince : 14;
  const [aiMotivation, setAiMotivation] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingAlternative, setSavingAlternative] = useState('');
  const [actionStatus, setActionStatus] = useState('');
  const message = MOTIVATIONAL_MESSAGES.reduce((previous, current) => safeDays >= current.days ? current : previous);
  const colorMap: Record<string, string> = {
    fire: 'border-brand-neon/40 bg-brand-neon/5',
    ok: 'border-blue-500/30 bg-blue-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    alert: 'border-orange-500/30 bg-orange-500/5',
    danger: 'border-red-500/30 bg-red-500/5',
    comeback: 'border-brand-magenta/30 bg-brand-magenta/5',
  };

  const generateAIMotivation = async () => {
    setLoading(true);
    try {
      const prompt = `
Escreva uma mensagem motivacional personalizada e impactante, com no máximo 3 frases, para ${userName}.
Contexto: ${safeDays} dias sem treinar. Objetivo: ${goal}. Streak máximo: ${streak.longestStreak} dias.
Tom: energético, direto, sem clichês vazios. Mencione o objetivo e o histórico de forma específica.
`;
      const response = await generateGeminiContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });
      setAiMotivation(response.text || '');
    } catch {
      setAiMotivation('IA indisponível no momento. Verifique login, limite do plano e configuração do proxy.');
    } finally {
      setLoading(false);
    }
  };

  const scheduleAlternativeWorkout = async (label: string, durationMinutes: number) => {
    setSavingAlternative(label);
    setActionStatus('');

    try {
      const suggestion = await createAlternativeWorkoutSuggestion({
        durationMinutes,
        goal,
        reason: 'reativacao_automatica',
      });

      await createWorkoutCalendarItem({
        eventType: 'workout',
        title: suggestion.title,
        scheduledFor: new Date().toISOString().slice(0, 10),
        source: 'reactivation_engine',
        metadata: {
          alternativeWorkoutId: suggestion.id,
          exercises: suggestion.exercises,
          label,
        },
      });

      setActionStatus('Treino alternativo salvo na agenda.');
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : 'Não foi possível salvar o treino alternativo.');
    } finally {
      setSavingAlternative('');
    }
  };

  if (safeDays === 0 && streak.currentStreak < 3) return null;

  return (
    <div className={`border-2 p-5 ${colorMap[message.level]}`}>
      <p className="text-brand-light font-bold text-base mb-2">{message.message}</p>

      {safeDays >= 2 && (
        <>
          <button onClick={generateAIMotivation} type="button" className="text-xs text-brand-neon border-2 border-brand-neon/30 px-3 py-2 mb-3 hover:bg-brand-neon/10 transition-colors uppercase font-bold">
            {loading ? 'Gerando...' : 'Motivação personalizada pela IA'}
          </button>
          {aiMotivation && <p className="text-brand-light/80 text-sm italic whitespace-pre-wrap">{aiMotivation}</p>}
        </>
      )}

      {safeDays >= 3 && (
        <div className="mt-4 p-3 bg-brand-dark/70 border-2 border-brand-light/10">
          <p className="text-xs text-brand-muted mb-2">Treino expresso para retornar agora</p>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Full body 20min', duration: 20 },
              { label: 'Upper body 15min', duration: 15 },
              { label: 'Core + mobilidade 12min', duration: 12 },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => scheduleAlternativeWorkout(item.label, item.duration)}
                disabled={savingAlternative === item.label}
                className="px-3 py-2 text-xs bg-brand-neon/10 border-2 border-brand-neon/30 text-brand-neon hover:bg-brand-neon/20 transition-colors disabled:opacity-50"
              >
                {savingAlternative === item.label ? 'Salvando...' : item.label}
              </button>
            ))}
          </div>
          {actionStatus && <p className="text-xs text-brand-light/70 mt-2">{actionStatus}</p>}
        </div>
      )}
    </div>
  );
}
