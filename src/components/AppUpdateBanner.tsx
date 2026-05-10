import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { listenForAppUpdate, reloadForUpdate } from '../utils/pwaUtils';

export function AppUpdateBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return listenForAppUpdate(() => setVisible(true));
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-xl bg-brand-gray border border-brand-neon/30 rounded-3xl p-5 shadow-2xl print:hidden">
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-4 top-4 text-white/50 hover:text-white"
        aria-label="Fechar banner de atualizacao"
      >
        <X size={18} />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div className="rounded-2xl bg-brand-neon text-brand-dark p-3">
          <RefreshCw size={20} />
        </div>

        <div>
          <p className="text-white font-black">Nova versao disponivel</p>
          <p className="text-brand-muted text-sm mt-1">
            Atualize para usar melhorias de performance, correcoes e recursos novos.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={reloadForUpdate}
        className="mt-4 w-full py-3 rounded-xl bg-brand-neon text-brand-dark font-black"
      >
        Atualizar agora
      </button>
    </div>
  );
}
