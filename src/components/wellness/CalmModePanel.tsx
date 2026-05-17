import React, { useState } from 'react';
import { ShieldAlert, Heart, Wind, Droplets, Activity, Phone } from 'lucide-react';
import { getInitialCalmModeState, activateCalmMode, deactivateCalmMode, advanceCalmModeStep, CalmModeState } from '../../services/wellness/calmModeService';

export function CalmModePanel() {
  const [state, setState] = useState<CalmModeState>(getInitialCalmModeState());

  const handleActivate = () => setState(activateCalmMode());
  const handleDeactivate = () => setState(deactivateCalmMode());
  const handleNextStep = () => setState(advanceCalmModeStep(state));

  if (!state.isActive) {
    return (
      <div className="rounded-[24px] border-2 border-brand-light/20 bg-brand-gray p-6 shadow-sm transition-all hover:border-brand-magenta/50">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-brand-magenta/10 p-3 text-brand-magenta">
            <Heart className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-xl uppercase text-brand-light">Modo Calma</h3>
            <p className="mt-1 font-mono text-xs text-brand-light/70">Apoio para momentos de desconforto.</p>
          </div>
          <button
            onClick={handleActivate}
            className="rounded-full border-2 border-brand-magenta bg-transparent px-4 py-2 font-mono text-xs uppercase tracking-widest text-brand-magenta transition-colors hover:bg-brand-magenta hover:text-brand-dark"
          >
            Ativar
          </button>
        </div>
      </div>
    );
  }

  const stepContent = {
    breathe: { icon: <Wind className="h-8 w-8" />, title: '1. Respire Fundo', text: 'Inspire pelo nariz, expire pela boca. No seu ritmo.' },
    sit: { icon: <Activity className="h-8 w-8" />, title: '2. Sente-se', text: 'Encontre um lugar confortável e seguro para sentar.' },
    water: { icon: <Droplets className="h-8 w-8" />, title: '3. Beba Água', text: 'Tome pequenos goles de água para se hidratar.' },
    reduce_intensity: { icon: <Heart className="h-8 w-8" />, title: '4. Reduza a Intensidade', text: 'Faça uma pausa no treino. O corpo precisa de recuperação.' },
    seek_help: { icon: <Phone className="h-8 w-8" />, title: '5. Procure Ajuda', text: 'Se o desconforto persistir, fale com alguém ou procure ajuda médica.' },
  };

  const currentStep = stepContent[state.step];

  return (
    <div className="rounded-[24px] border-2 border-brand-magenta bg-brand-dark p-6 shadow-brutal-magenta">
      <div className="mb-4 flex items-center gap-3 border-b-2 border-brand-magenta/20 pb-4">
        <ShieldAlert className="h-6 w-6 text-brand-magenta" />
        <p className="font-mono text-xs leading-relaxed text-brand-light/80">
          <strong className="text-brand-magenta">Aviso Seguro:</strong> Este recurso é apoio de bem-estar e não substitui atendimento médico ou psicológico. Se você estiver em risco, procure ajuda imediata.
        </p>
      </div>

      <div className="flex flex-col items-center py-6 text-center">
        <div className="mb-4 text-brand-magenta">
          {currentStep.icon}
        </div>
        <h4 className="font-display text-2xl uppercase text-brand-light">{currentStep.title}</h4>
        <p className="mt-2 max-w-sm font-mono text-sm text-brand-light/70">{currentStep.text}</p>
      </div>

      <div className="mt-4 flex justify-between gap-4 border-t-2 border-brand-magenta/20 pt-4">
        <button
          onClick={handleDeactivate}
          className="rounded-full border-2 border-brand-light/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-brand-light transition-colors hover:border-brand-light"
        >
          Sair
        </button>
        {state.step !== 'seek_help' && (
          <button
            onClick={handleNextStep}
            className="rounded-full bg-brand-magenta px-6 py-2 font-mono text-xs uppercase tracking-widest text-brand-dark shadow-brutal-magenta"
          >
            Próximo Passo
          </button>
        )}
      </div>
    </div>
  );
}
