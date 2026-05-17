import React from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import { type PlanMarketplaceItem } from '../../services/monetizationEngine';

interface Props {
  catalog: PlanMarketplaceItem[];
}

export function PlanMarketplacePreview({ catalog }: Props) {
  return (
    <div className="rounded-[24px] border-4 border-brand-magenta bg-brand-dark p-5 shadow-brutal-magenta">
      <div className="flex items-center gap-3 mb-4">
        <ShoppingBag className="h-6 w-6 text-brand-magenta" />
        <h3 className="font-display text-xl uppercase text-brand-light">Marketplace (Prévia)</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {catalog.map(plan => (
          <div key={plan.id} className="rounded-xl border-2 border-brand-light/20 p-4 bg-brand-gray">
            <h4 className="font-display text-lg text-brand-light">{plan.title}</h4>
            <p className="font-mono text-xs text-brand-light/70 mt-1 mb-2 line-clamp-2">
              {plan.description}
            </p>
            <div className="flex justify-between items-center mt-auto">
              <span className="font-mono text-brand-neon font-bold">R$ {plan.price.toFixed(2)}</span>
              <div className="flex items-center gap-1 text-brand-light">
                <Star className="h-3 w-3 fill-current text-yellow-400" />
                <span className="font-mono text-xs">{plan.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
