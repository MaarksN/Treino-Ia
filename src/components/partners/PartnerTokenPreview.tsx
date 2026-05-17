import React from 'react';
import { QrCode, Lock } from 'lucide-react';
import { checkPartnerTokenAvailability } from '../../services/partners/partnerTokenGuard';

export function PartnerTokenPreview() {
  const status = checkPartnerTokenAvailability();

  return (
    <div className="rounded-[24px] border-2 border-brand-light/30 bg-brand-gray p-6 opacity-75">
      <div className="mb-4 flex items-center gap-3 border-b-2 border-brand-light/10 pb-4">
        <QrCode className="h-6 w-6 text-brand-light/60" />
        <h3 className="font-display text-xl uppercase text-brand-light/80">Tokens & Parceiros</h3>
        <Lock className="ml-auto h-5 w-5 text-brand-magenta" />
      </div>

      <div className="flex flex-col items-center justify-center space-y-4 py-4">
        <div className="rounded-xl border border-dashed border-brand-magenta/40 bg-brand-magenta/5 p-8">
          <QrCode className="h-16 w-16 text-brand-magenta/30" />
        </div>
        <p className="text-center font-mono text-sm text-brand-light/60">
          Acesso a parceiros físicos via QR Code.
        </p>
      </div>

      {status.isBlocked && (
        <div className="mt-4 rounded-[16px] bg-brand-dark p-4">
          <p className="font-mono text-xs uppercase tracking-widest text-brand-magenta">Dependência Externa</p>
          <p className="mt-2 font-mono text-sm text-brand-light/80">
            {status.message}
          </p>
        </div>
      )}
    </div>
  );
}
