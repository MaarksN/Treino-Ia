import React from 'react';
import { Target } from 'lucide-react';
import { type UlyssesContract } from '../../services/monetizationEngine';

interface Props {
  contract: UlyssesContract;
}

export function UlyssesContractPreview({ contract }: Props) {
  return (
    <div className="rounded-[24px] border-4 border-brand-neon bg-brand-dark p-5 shadow-brutal-neon">
      <div className="flex items-center gap-3 mb-4">
        <Target className="h-6 w-6 text-brand-neon" />
        <h3 className="font-display text-xl uppercase text-brand-light">Contrato de Ulisses</h3>
      </div>

      <div className="space-y-3">
        <p className="font-mono text-sm text-brand-light/80">
          <strong>Meta:</strong> {contract.goal}
        </p>
        <p className="font-mono text-sm text-brand-light/80">
          <strong>Valor em jogo (Simulação):</strong> R$ {contract.stakeAmount.toFixed(2)}
        </p>
        <div className="h-2 w-full bg-brand-gray rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-neon transition-all"
            style={{ width: `${contract.progress}%` }}
          />
        </div>
        <p className="font-mono text-xs text-brand-muted">
          *Esta é uma prévia local. Cobranças reais requerem integração com backend.
        </p>
      </div>
    </div>
  );
}
