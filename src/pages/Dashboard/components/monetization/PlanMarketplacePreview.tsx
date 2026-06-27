import React, { useState } from 'react';
import { ShoppingBag, Star, Loader2 } from 'lucide-react';
import { type PlanMarketplaceItem } from '../../services/monetizationEngine';
import { billingService } from '../../../../services/billingService';

interface Props {
  catalog: PlanMarketplaceItem[];
}

export function PlanMarketplacePreview({ catalog }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleBuy = async (plan: PlanMarketplaceItem) => {
    if (!plan.stripePriceId) return;

    setLoadingId(plan.id);
    try {
      await billingService.createCheckoutSession(plan.stripePriceId, 'one_time');
    } catch (err) {
      alert('Nao foi possivel iniciar o checkout. Verifique sua conexao.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-[24px] border-4 border-brand-magenta bg-brand-dark p-5 shadow-brutal-magenta">
      <div className="flex items-center gap-3 mb-4">
        <ShoppingBag className="h-6 w-6 text-brand-magenta" />
        <h3 className="font-display text-xl uppercase text-brand-light">Marketplace</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {catalog.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col rounded-xl border-2 border-brand-light/20 p-4 bg-brand-gray"
          >
            <h4 className="font-display text-lg text-brand-light">{plan.title}</h4>
            <p className="font-mono text-xs text-brand-light/70 mt-1 mb-4 line-clamp-2">
              {plan.description}
            </p>
            <div className="flex justify-between items-center mt-auto mb-4">
              <span className="font-mono text-brand-neon font-bold">
                R$ {plan.price.toFixed(2)}
              </span>
              <div className="flex items-center gap-1 text-brand-light">
                <Star className="h-3 w-3 fill-current text-yellow-400" />
                <span className="font-mono text-xs">{plan.rating}</span>
              </div>
            </div>

            <button
              onClick={() => handleBuy(plan)}
              disabled={!!loadingId}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-magenta py-2 font-mono text-xs uppercase tracking-widest text-brand-light hover:brightness-110 disabled:opacity-50"
            >
              {loadingId === plan.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Comprar agora'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
