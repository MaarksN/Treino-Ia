import React, { useState } from 'react';
import { AlertTriangle, Gift, X } from 'lucide-react';

interface Props {
  onConfirmCancel: () => void;
  onAcceptOffer: () => void;
  onClose: () => void;
}

export function CancelRetention({ onConfirmCancel, onAcceptOffer, onClose }: Props) {
  const [step, setStep] = useState<'confirm' | 'offer'>('confirm');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-gray border border-white/10 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white"
        >
          <X size={18} />
        </button>

        {step === 'confirm' && (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Tem certeza?</h2>
            <p className="text-brand-muted text-sm mb-6">
              Ao cancelar, você perderá acesso às análises premium, IA ilimitada e planos exclusivos no fim do ciclo atual.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setStep('offer')}
                className="w-full py-3 bg-brand-neon text-brand-dark font-black rounded-xl hover:scale-105 transition-transform"
              >
                Manter minha assinatura
              </button>
              <button
                onClick={onConfirmCancel}
                className="w-full py-3 bg-white/5 text-white/70 font-bold rounded-xl hover:bg-white/10 transition-colors"
              >
                Sim, quero cancelar
              </button>
            </div>
          </div>
        )}

        {step === 'offer' && (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-brand-neon/10 text-brand-neon flex items-center justify-center rounded-full mb-4">
              <Gift size={32} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Espera! Que tal 1 mês grátis?</h2>
            <p className="text-brand-muted text-sm mb-6">
              Sabemos que a rotina aperta. Fique com a gente e o próximo mês é por nossa conta.
            </p>

            <div className="space-y-3">
              <button
                onClick={onAcceptOffer}
                className="w-full py-3 bg-brand-neon text-brand-dark font-black rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(163,230,53,0.3)]"
              >
                Aceitar 1 Mês Grátis
              </button>
              <button
                onClick={onConfirmCancel}
                className="w-full py-3 bg-transparent text-white/50 font-bold hover:text-white transition-colors text-sm"
              >
                Não, prefiro cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
