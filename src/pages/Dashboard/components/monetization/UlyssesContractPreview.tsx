import React, { useState } from 'react';
import { Target, Loader2, ShieldCheck } from 'lucide-react';
import { type UlyssesContract } from '../../services/monetizationEngine';
import { billingService } from '../../../../services/billingService';

interface Props {
  contract: UlyssesContract;
}

export function UlyssesContractPreview({ contract }: Props) {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      // Usando um price_id genérico para o caução do contrato
      await billingService.createCheckoutSession('price_ulysses_stake_50', 'one_time');
    } catch (err) {
      alert('Nao foi possivel iniciar o contrato. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isActive = contract.status === 'active' && contract.progress > 0;

  return (
    <div className="rounded-[24px] border-4 border-brand-neon bg-brand-dark p-5 shadow-brutal-neon">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-brand-neon" />
          <h3 className="font-display text-xl uppercase text-brand-light">Contrato de Ulisses</h3>
        </div>
        {isActive && (
          <div className="flex items-center gap-1 rounded-full bg-brand-neon/20 px-2 py-1">
            <ShieldCheck className="h-3 w-3 text-brand-neon" />
            <span className="font-mono text-[10px] uppercase text-brand-neon">Ativo</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brand-muted mb-1">Sua Meta</p>
          <p className="font-mono text-sm text-brand-light leading-tight">{contract.goal}</p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brand-muted mb-1">Caução em jogo</p>
            <p className="font-mono text-lg font-bold text-brand-neon">R$ {contract.stakeAmount.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs uppercase tracking-widest text-brand-muted mb-1">Progresso</p>
            <p className="font-mono text-sm text-brand-light">{contract.progress}%</p>
          </div>
        </div>

        <div className="h-2 w-full bg-brand-gray rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-neon transition-all shadow-[0_0_10px_rgba(57,255,20,0.5)]"
            style={{ width: `${contract.progress}%` }}
          />
        </div>

        {!isActive && (
          <button
            onClick={handleActivate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-brand-neon bg-transparent py-2 font-mono text-xs uppercase tracking-widest text-brand-neon hover:bg-brand-neon hover:text-brand-dark transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              'Ativar Contrato Real'
            )}
          </button>
        )}

        <p className="font-mono text-[10px] text-brand-muted leading-tight">
          O valor sera estornado integralmente se voce cumprir a meta. Em caso de falha, o valor e doado para caridade.
        </p>
      </div>
    </div>
  );
}
