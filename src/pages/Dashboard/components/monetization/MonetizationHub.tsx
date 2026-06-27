import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  ulyssesContractPreview,
  marketplaceCatalog,
  donationGuard,
  selfBetGuard,
  payPerWorkoutGuard,
} from '../../services/monetizationEngine';
import { UlyssesContractPreview } from './UlyssesContractPreview';
import { PlanMarketplacePreview } from './PlanMarketplacePreview';
import { billingService } from '../../../../services/billingService';

export function MonetizationHub() {
  const [payPerWorkoutLoading, setPayPerWorkoutLoading] = useState(false);

  const handlePayPerWorkout = async () => {
    setPayPerWorkoutLoading(true);
    try {
      await billingService.createCheckoutSession('price_pay_per_workout_base', 'one_time');
    } catch (err) {
      alert('Nao foi possivel processar o pagamento do treino.');
    } finally {
      setPayPerWorkoutLoading(false);
    }
  };

  return (
    <section className="mb-8 space-y-6">
      <h2 className="font-display text-3xl uppercase text-brand-light">Monetização & Desafios</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <UlyssesContractPreview contract={ulyssesContractPreview} />
        <PlanMarketplacePreview catalog={marketplaceCatalog} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-xl border-2 border-brand-light/20 p-4 bg-brand-gray text-center">
          <div>
            <p className="font-mono text-sm text-brand-light">Pay-per-workout</p>
            <p className="font-mono text-[10px] text-brand-muted mt-2">
              Desbloqueie recursos premium apenas para o treino de hoje por R$ {payPerWorkoutGuard.basePrice.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handlePayPerWorkout}
            disabled={payPerWorkoutLoading}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-brand-light/10 py-2 font-mono text-[10px] uppercase tracking-widest text-brand-light hover:bg-brand-light/20 disabled:opacity-50"
          >
            {payPerWorkoutLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              'Ativar por 24h'
            )}
          </button>
        </div>
        <div className="rounded-xl border-2 border-brand-light/20 p-4 bg-brand-gray text-center">
          <p className="font-mono text-sm text-brand-light">Doações por Desempenho</p>
          <p className="font-mono text-xs text-brand-muted mt-2">
            Status: {donationGuard.enabled ? 'Ativo' : 'Bloqueado (Falta Provider)'}
          </p>
        </div>
        <div className="rounded-xl border-2 border-brand-light/20 p-4 bg-brand-gray text-center">
          <p className="font-mono text-sm text-brand-light">Apostas contra si mesmo</p>
          <p className="font-mono text-xs text-brand-muted mt-2">
            Status:{' '}
            {selfBetGuard.complianceCheckPassed ? 'Verificado' : 'Bloqueado (Compliance KYC)'}
          </p>
        </div>
      </div>
    </section>
  );
}
