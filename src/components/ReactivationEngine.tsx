import React, { useState } from 'react';
import { StreakData } from '../types';
import { generateGeminiContent } from '../services/geminiProxyClient';


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
  const daysSince = streak.lastWorkoutDate ? Math.floor((new Date().setHours(0,0,0,0) - new Date(streak.lastWorkoutDate).getTime()) / 86400000) : Infinity;
  const safeDays = Number.isFinite(daysSince) ? daysSince : 14;
  const [aiMotivation, setAiMotivation] = useState('');
  const [loading, setLoading] = useState(false);
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
            {['Full body 20min', 'Upper body', 'Core + mobilidade'].map(item => (
              <button key={item} type="button" className="px-3 py-2 text-xs bg-brand-neon/10 border-2 border-brand-neon/30 text-brand-neon hover:bg-brand-neon/20 transition-colors">
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
