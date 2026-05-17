import React, { useState } from 'react';

export const HydrationManualScanner: React.FC = () => {
  const [colorLevel, setColorLevel] = useState<number>(3);
  const [message, setMessage] = useState<string>('Corrente amarela clara (ideal). Mantenha a hidratação.');

  const updateColor = (level: number) => {
    setColorLevel(level);
    if (level <= 3) {
      setMessage('Corrente amarela clara (ideal). Mantenha a hidratação.');
    } else if (level <= 5) {
      setMessage('Corrente amarelada. Você precisa beber um pouco mais de água.');
    } else {
      setMessage('Corrente escura (Alerta). Sinal de desidratação significativa. Beba água imediatamente.');
    }
  };

  const attemptCameraScan = () => {
    alert('Erro de permissão: Acesso à câmera para hidratação está bloqueado (Item 89 Guard). O recurso de scanner automatizado não está disponível no momento por risco de privacidade. Faça o registro manual.');
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
