import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  onConfirmCancel: () => void;
  onClose: () => void;
}

export function CancelRetention({ onConfirmCancel, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-gray border border-white/10 rounded-3xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-white/50 hover:text-white">
          <X size={18} />
        </button>

        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Gerenciar cancelamento</h2>
          <p className="text-brand-muted text-sm mb-6">
            O cancelamento e qualquer alteracao de assinatura acontecem no portal seguro da Stripe.
          </p>

          <div className="space-y-3">
            <button
              onClick={onConfirmCancel}
              className="w-full py-3 bg-brand-neon text-brand-dark font-black rounded-xl hover:scale-105 transition-transform"
            >
              Abrir portal Stripe
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-white/5 text-white/70 font-bold rounded-xl hover:bg-white/10 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
