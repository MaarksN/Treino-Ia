import React, { useState } from 'react';
import { BiomechanicalDigitalTwin } from './BiomechanicalDigitalTwin';
import { speakSafely } from '../services/voiceCoach';
import { getPainDrivenSuggestions } from '../services/painDrivenSuggestions';
import { formatAIPersonality, AIPersonalityType } from '../services/aiPersonality';
import { evaluateFormSafely } from '../services/aiFormChecker';
import { Brain, Volume2, AlertCircle } from 'lucide-react';

export function AdvancedAIPanel() {
  const [persona, setPersona] = useState<AIPersonalityType>('technical');

  // Fake muscle data for demonstration without clinical claims
  const muscleLoads = [
    { muscleGroup: 'Peitoral', loadPercentage: 80 },
    { muscleGroup: 'Tríceps', loadPercentage: 65 },
    { muscleGroup: 'Ombros', loadPercentage: 40 },
  ];

  // Example pain log interaction
  const examplePainLog = { bodyPart: 'Lombar', intensity: 5 };
  const painSuggestion = getPainDrivenSuggestions(examplePainLog);

  // Form check guard status
  const formCheckStatus = evaluateFormSafely({});

  const handleSpeak = () => {
    const text = formatAIPersonality({
      type: persona,
      baseMessage: 'Seu treino está rendendo bem hoje',
    });
    speakSafely({ text, lang: 'pt-BR' });
  };

  return (
    <section className="mb-8 rounded-[28px] border-4 border-brand-neon bg-brand-gray p-6 shadow-brutal-neon md:p-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="rounded-[24px] border-2 border-brand-neon bg-brand-neon p-4 text-brand-dark shadow-brutal-neon">
          <Brain className="h-8 w-8" />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">
            Pack de IA Avançada
          </p>
          <h2 className="mt-2 font-display text-4xl uppercase text-brand-light md:text-5xl">
            Assistência Inteligente
          </h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BiomechanicalDigitalTwin muscleLoads={muscleLoads} />

        <div className="space-y-6">
          <div className="rounded-[24px] border-2 border-brand-light/20 p-5">
            <h3 className="mb-3 font-mono text-sm uppercase text-brand-light">Personalidade do Coach</h3>
            <div className="flex gap-2">
              {(['technical', 'motivator', 'friendly'] as AIPersonalityType[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPersona(p)}
                  className={`rounded-full border-2 px-4 py-2 font-mono text-xs uppercase ${
                    persona === p
                      ? 'border-brand-neon bg-brand-neon text-brand-dark shadow-brutal-neon'
                      : 'border-brand-light/20 text-brand-light hover:border-brand-light'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSpeak}
              className="mt-4 flex items-center gap-2 rounded-full border-2 border-brand-light/20 bg-brand-gray px-4 py-2 font-mono text-xs uppercase tracking-widest text-brand-light transition-colors hover:border-brand-neon hover:text-brand-neon"
            >
              <Volume2 className="h-4 w-4" />
              Ouvir Coach
            </button>
          </div>

          <div className="rounded-[24px] border-2 border-brand-magenta/50 bg-brand-magenta/10 p-5">
            <div className="mb-2 flex items-center gap-2 text-brand-magenta">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-mono text-sm uppercase">Feedback de Dor</h3>
            </div>
            <p className="font-mono text-xs leading-5 text-brand-light/80">
              {painSuggestion.message}
            </p>
          </div>

          <div className="rounded-[24px] border-2 border-brand-light/20 p-5">
            <h3 className="mb-2 font-mono text-sm uppercase text-brand-light">Form Checker API</h3>
            <p className="font-mono text-xs text-brand-light/60">
              Status: {formCheckStatus.isAvailable ? 'Disponível' : `Indisponível (${formCheckStatus.blockedReason})`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
