import React, { useState } from 'react';
import {
  DEFAULT_HYDRATION_COLOR_LEVEL,
  getHydrationColorMessage,
  HYDRATION_CAMERA_GUARD_MESSAGE,
} from './HydrationManualScanner.logic';

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

  return (
    <div className="p-4 border rounded shadow-sm bg-white mt-4" data-testid="hydration-scanner">
      <h3 className="text-lg font-bold mb-2">Avaliação de Hidratação (Item 89)</h3>
      <p className="text-sm text-gray-700 mb-4">
        O scanner de câmera está desativado por questões de privacidade. Por favor, registre manualmente a cor.
      </p>

      <div className="mb-4">
        <button
          onClick={attemptCameraScan}
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200"
        >
          Tentar Escanear pela Câmera (Guard)
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 border rounded">
        <h4 className="font-semibold text-sm mb-2">Escala de Cor (Manual)</h4>
        <input
          type="range"
          min="1"
          max="8"
          value={colorLevel}
          onChange={(e) => updateColor(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Transparente (1)</span>
          <span>Amarelo Claro (3)</span>
          <span>Amarelo Escuro (5)</span>
          <span>Âmbar/Marrom (8)</span>
        </div>
        <div className="mt-4 text-sm font-semibold p-2 border rounded bg-white">
          <p>Nível atual selecionado: {colorLevel}</p>
          <p className="mt-1 text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
};
