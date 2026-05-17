import React from 'react';
import { ulyssesContractPreview, marketplaceCatalog, donationGuard, selfBetGuard, payPerWorkoutGuard } from '../../services/monetizationEngine';
import { UlyssesContractPreview } from './UlyssesContractPreview';
import { PlanMarketplacePreview } from './PlanMarketplacePreview';

export function MonetizationHub() {
  return (
    <section className="mb-8 space-y-6">
      <h2 className="font-display text-3xl uppercase text-brand-light">Monetização & Desafios</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <UlyssesContractPreview contract={ulyssesContractPreview} />
        <PlanMarketplacePreview catalog={marketplaceCatalog} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border-2 border-brand-light/20 p-4 bg-brand-gray text-center">
            <p className="font-mono text-sm text-brand-light">Pay-per-workout</p>
            <p className="font-mono text-xs text-brand-muted mt-2">Base configurada: R$ {payPerWorkoutGuard.basePrice.toFixed(2)}</p>
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
              Status: {selfBetGuard.complianceCheckPassed ? 'Verificado' : 'Bloqueado (Compliance KYC)'}
            </p>
        </div>
      </div>
    </section>
  );
}
