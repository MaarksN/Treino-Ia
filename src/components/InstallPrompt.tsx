import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { BeforeInstallPromptEvent, isStandalone } from '../utils/pwaUtils';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-xl bg-brand-gray border border-brand-neon/30 rounded-3xl p-5 shadow-2xl print:hidden">
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-4 top-4 text-white/50 hover:text-white"
        aria-label="Fechar convite de instalacao"
      >
        <X size={18} />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div className="rounded-2xl bg-brand-neon text-brand-dark p-3">
          <Download size={20} />
        </div>

        <div>
          <p className="text-white font-black">Instale o Treino App</p>
          <p className="text-brand-muted text-sm mt-1">
            Use como aplicativo, com acesso rapido, modo standalone e experiencia mais fluida.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={install}
          className="flex-1 py-3 rounded-xl bg-brand-neon text-brand-dark font-black"
        >
          Instalar
        </button>

        <button
          type="button"
          onClick={() => setVisible(false)}
          className="px-4 py-3 rounded-xl bg-white/10 text-white font-bold"
        >
          Depois
        </button>
      </div>
    </div>
  );
}
