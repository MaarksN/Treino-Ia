import React, { useState } from 'react';
import {
  DEFAULT_HYDRATION_COLOR_LEVEL,
  getHydrationColorMessage,
  HYDRATION_CAMERA_GUARD_MESSAGE,
} from './HydrationManualScanner.logic';
import { InlineNotice } from '../ui/InlineNotice';
import { Droplets, Camera } from 'lucide-react';

export const HydrationManualScanner: React.FC = () => {
  const [colorLevel, setColorLevel] = useState<number>(DEFAULT_HYDRATION_COLOR_LEVEL);
  const [message, setMessage] = useState<string>(getHydrationColorMessage(DEFAULT_HYDRATION_COLOR_LEVEL));

  const updateColor = (level: number) => {
    setColorLevel(level);
    setMessage(getHydrationColorMessage(level));
  };

  const attemptCameraScan = () => {
    alert(HYDRATION_CAMERA_GUARD_MESSAGE);
  };

  // Generates a mock color array for the slider gradient effect
  const colorGradient = [
    '#f8fafc', '#fef08a', '#fde047', '#facc15',
    '#eab308', '#ca8a04', '#a16207', '#713f12'
  ];

  return (
    <div className="rounded-[24px] border-2 border-brand-light/10 bg-brand-dark p-5" data-testid="hydration-scanner">
      <div className="flex items-center gap-3 mb-4">
        <Droplets className="h-5 w-5 text-brand-neon" />
        <h3 className="font-display text-2xl uppercase text-brand-light">Cor da Urina</h3>
      </div>

      <InlineNotice type="info" title="Privacidade Garantida">
        O scanner de câmera está desativado por guard. Por favor, registre manualmente a cor ou use o botão para testar a trava.
      </InlineNotice>

      <div className="mt-4 flex flex-col gap-4">
        <button
          onClick={attemptCameraScan}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-magenta/50 bg-brand-magenta/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-brand-magenta hover:bg-brand-magenta/20 transition-colors"
        >
          <Camera className="h-4 w-4" />
          Testar Câmera (Guard)
        </button>

        <div className="mt-2 rounded-[20px] border border-brand-light/10 bg-brand-gray p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted mb-4">Escala Visual (1-8)</p>
          <div className="relative mb-6">
            <input
              type="range"
              min="1"
              max="8"
              value={colorLevel}
              onChange={(e) => updateColor(Number(e.target.value))}
              className="w-full appearance-none h-3 rounded-full bg-transparent z-10 relative cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${colorGradient.join(', ')})`,
              }}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-brand-light/10 pt-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border border-brand-light/20 shadow-inner"
                style={{ backgroundColor: colorGradient[colorLevel - 1] }}
              />
              <p className="font-display text-3xl uppercase text-brand-light">Nível {colorLevel}</p>
            </div>
            <p className="font-mono text-xs leading-5 text-brand-light/80 text-right">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
