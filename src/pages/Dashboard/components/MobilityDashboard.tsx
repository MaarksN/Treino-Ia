import React, { useState } from 'react';

export interface MobilityLog {
  id: string;
  date: string;
  joint: string;
  score: number; // 1-10
  notes: string;
}

export const MobilityDashboard: React.FC = () => {
  const [logs, setLogs] = useState<MobilityLog[]>([]);
  const [joint, setJoint] = useState('Ombro');
  const [score, setScore] = useState(5);
  const [notes, setNotes] = useState('');

  const saveLog = () => {
    const newLog: MobilityLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      joint,
      score,
      notes
    };
    setLogs([newLog, ...logs]);
    setJoint('Ombro');
    setScore(5);
    setNotes('');
  };

  const attemptCameraScan = () => {
    alert('Erro de permissão: Acesso à câmera para avaliação articular está bloqueado ou em fundação devido a riscos de privacidade/integração (Item 88 Guard). Faça o registro manual.');
  };

  return (
    <div className="p-4 border rounded shadow-sm bg-white mt-4" data-testid="mobility-dashboard">
      <h3 className="text-lg font-bold mb-2">Mobilidade Articular (Item 88)</h3>
      <p className="text-sm text-gray-700 mb-4">Acompanhe sua amplitude de movimento e testes de mobilidade de forma segura.</p>

      <div className="mb-4">
        <button
          onClick={attemptCameraScan}
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200"
        >
          Tentar Escanear pela Câmera (Guard)
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-4 p-3 bg-gray-50 border rounded">
        <h4 className="font-semibold text-sm">Novo Registro Manual</h4>
        <label className="text-sm">
          Articulação:
          <select value={joint} onChange={e => setJoint(e.target.value)} className="ml-2 border rounded p-1">
            <option value="Ombro">Ombro</option>
            <option value="Quadril">Quadril</option>
            <option value="Tornozelo">Tornozelo</option>
            <option value="Torácica">Coluna Torácica</option>
          </select>
        </label>
        <label className="text-sm">
          Pontuação (1-10):
          <input type="number" min={1} max={10} value={score} onChange={e => setScore(Number(e.target.value))} className="ml-2 border rounded p-1 w-16" />
        </label>
        <label className="text-sm">
          Notas:
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="ml-2 border rounded p-1 w-full max-w-xs" />
        </label>
        <button onClick={saveLog} className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm self-start hover:bg-green-600">
          Salvar
        </button>
      </div>

      {logs.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-sm mb-2">Histórico</h4>
          <ul className="text-sm">
            {logs.map(log => (
              <li key={log.id} className="border-b py-1">
                <strong>{log.joint}</strong> - Nota: {log.score}/10 {log.notes && <span>- {log.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
