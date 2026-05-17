import { memo, useState, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { retroSoundService } from '../../services/socialContent/retroSoundService';

export const RetroSoundToggle = memo(function RetroSoundToggle() {
  const [isMuted, setIsMuted] = useState(retroSoundService.getMuted());

  const handleToggle = useCallback(() => {
    const nextMuteState = retroSoundService.toggleMute();
    setIsMuted(nextMuteState);
  }, []);

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`flex items-center justify-center p-2 rounded-full transition-colors ${
        isMuted ? 'text-brand-muted hover:text-brand-light' : 'text-brand-neon hover:text-brand-light shadow-[0_0_10px_var(--color-brand-neon)]'
      }`}
      aria-label={isMuted ? "Ativar som arcade" : "Desativar som arcade"}
      title={isMuted ? "Ativar som arcade" : "Desativar som arcade"}
    >
      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </button>
  );
});
