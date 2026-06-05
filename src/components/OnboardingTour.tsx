import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const STEPS = [
  {
    title: 'Bem-vindo ao Treino IA',
    description:
      'Um fluxo direto para saber o que treinar hoje, executar o treino e acompanhar sua evolução.',
    emoji: '🏋️',
  },
  {
    title: 'Anamnese objetiva',
    description:
      'Informe objetivo, nível, dias disponíveis, tempo por treino, equipamentos e limitações.',
    emoji: '🤖',
  },
  {
    title: 'Plano atual',
    description:
      'O app gera um plano inicial com divisão semanal, exercícios, séries, repetições e descanso.',
    emoji: '📊',
  },
  {
    title: 'Modo Treino Ativo',
    description:
      'Acompanhe o treino do dia, registre carga, repetições, RPE e marque as séries concluídas.',
    emoji: '⏱️',
  },
  {
    title: 'Histórico e evolução',
    description:
      'Cada treino finalizado alimenta seu histórico, volume total e resumo de evolução.',
    emoji: '📈',
  },
  {
    title: 'Recomendação simples',
    description:
      'Quando houver dados suficientes, você recebe um próximo ajuste simples para o plano.',
    emoji: '🎯',
  },
  {
    title: 'Pronto para começar!',
    description: 'Complete a anamnese e vá direto para o treino de hoje.',
    emoji: '🚀',
  },
];

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-brand-dark flex items-center justify-center p-6 print:hidden">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={onSkip}
            className="flex items-center gap-1 text-brand-muted text-sm hover:text-white transition-colors"
          >
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
              onClick={() => setStep((value) => value - 1)}
              className="flex items-center gap-1 px-5 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-semibold"
              aria-label="Anterior"
              title="Anterior"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => (isLast ? onComplete() : setStep((value) => value + 1))}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-brand-neon text-brand-dark font-black text-base"
          >
            {isLast ? (
              'Começar'
            ) : (
              <>
                Próximo <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>

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
