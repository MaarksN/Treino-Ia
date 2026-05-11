import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { saveOnboardingProgress } from '../services/retentionService';

const STEPS = [
  {
    title: 'Bem-vindo ao Treino App 💪',
    description: 'A plataforma mais completa de treino inteligente. Vamos te mostrar o que você pode fazer aqui.',
    emoji: '🏋️',
  },
  {
    title: 'IA Personalizada',
    description: 'O Gemini AI cria seu plano de treino completo baseado no seu perfil, objetivo e disponibilidade. Cada plano é único.',
    emoji: '🤖',
  },
  {
    title: 'Check-in Diário',
    description: 'Registre sono, estresse, energia e dor muscular. A IA calcula seu índice de prontidão e ajusta a intensidade do treino.',
    emoji: '📊',
  },
  {
    title: 'Modo Treino Ativo',
    description: 'Acompanhe cada série em tempo real, com timer de descanso automático, registro de carga/RPE e voz para guiar o treino.',
    emoji: '⏱️',
  },
  {
    title: 'Analytics Completo',
    description: 'Gráficos de volume, heatmap de consistência, radar muscular e histórico detalhado de todas as sessões.',
    emoji: '📈',
  },
  {
    title: 'APEX Coach',
    description: 'Converse com seu coach de IA a qualquer hora. Perguntas sobre treino, nutrição e recovery respondidas por especialista.',
    emoji: '🎯',
  },
  {
    title: 'Pronto para começar!',
    description: 'Complete o questionário de anamnese e deixe a IA criar o plano perfeito para você.',
    emoji: '🚀',
  },
];

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  useEffect(() => {
    let cancelled = false;

    saveOnboardingProgress({
      currentStep: step + 1,
      totalSteps: STEPS.length,
      payload: {
        title: current.title,
        source: 'onboarding_tour',
      },
    })
      .then(() => {
        if (!cancelled) setSyncStatus('Progresso salvo em nuvem.');
      })
      .catch(error => {
        if (!cancelled) {
          setSyncStatus(error instanceof Error ? error.message : 'Auto-save indisponível.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [step, current.title]);

  const complete = async (callback: () => void) => {
    try {
      await saveOnboardingProgress({
        currentStep: STEPS.length,
        totalSteps: STEPS.length,
        payload: { source: 'onboarding_tour' },
        completed: true,
      });
    } catch {
      // O fechamento local continua; o hub de retenção mostra o status de sincronização.
    } finally {
      callback();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-dark flex items-center justify-center p-6 print:hidden">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-6">
          <button type="button" onClick={() => complete(onSkip)} className="flex items-center gap-1 text-brand-muted text-sm hover:text-white transition-colors">
            <X size={16} /> Pular
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-8xl mb-4" style={{ animation: 'bounceIn 0.5s ease' }}>
            {current.emoji}
          </div>
          <div className="flex justify-center gap-1 mb-4">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: index === step ? 24 : 8,
                  background: index <= step ? 'var(--color-brand-neon)' : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white mb-3">{current.title}</h2>
          <p className="text-brand-muted leading-relaxed">{current.description}</p>
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(value => value - 1)}
              className="flex items-center gap-1 px-5 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-semibold"
              aria-label="Anterior"
              title="Anterior"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => (isLast ? complete(onComplete) : setStep(value => value + 1))}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-brand-neon text-brand-dark font-black text-base"
          >
            {isLast ? 'Começar' : <>Próximo <ChevronRight size={18} /></>}
          </button>
        </div>

        {syncStatus && (
          <p className="mt-3 text-center text-[11px] text-brand-muted">
            {syncStatus}
          </p>
        )}

        <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-neon rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
