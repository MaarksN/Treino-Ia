import React, { useState } from 'react';
import { getFlirCapability, getHrvCapability } from '../../../services/biohacking/biohackingGuards';
import { toggleBinauralBeat, getBinauralDisclaimer, type BinauralBeatSession } from '../../../services/biohacking/binauralBeatsService';
import { generateRecoverySuggestion } from '../../../services/biohacking/recoverySuggestionsService';
import { assessChronotype, getTimeBasedSuggestion } from '../../../services/biohacking/chronobiologyService';

export const BiohackingWidget: React.FC = () => {
  const [binauralSession, setBinauralSession] = useState<BinauralBeatSession | null>(null);

  const flir = getFlirCapability();
  const hrv = getHrvCapability();

  const recovery = generateRecoverySuggestion({ rpe: 7, muscleSoreness: 5, exhaustionLevel: 'moderate' });
  const chronoProfile = assessChronotype(8); // user wakes up at 8 AM
  const chronoAlert = getTimeBasedSuggestion(chronoProfile, new Date().getHours());

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Biohacking & Recovery</h3>

      {/* 85 - Cronobiologia */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cronotipo: {chronoProfile.chronotype.replace('_', ' ')}</h4>
        <p className="text-xs text-gray-500">{chronoProfile.currentRecommendation}</p>
        {chronoAlert && <p className="text-xs text-amber-600 mt-1">{chronoAlert}</p>}
      </div>

      {/* 84 - Sugestão de Banho */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Recuperação Sugerida</h4>
        <p className="text-sm text-blue-700 dark:text-blue-400">{recovery.description}</p>
        <p className="text-xs text-blue-500/70 mt-2 italic">{recovery.disclaimer}</p>
      </div>

      {/* 83 - Sons Binaurais */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Frequências Binaurais</h4>
        <div className="flex gap-2">
          {['focus', 'relaxation', 'recovery'].map((type) => (
            <button
              key={type}
              onClick={() => setBinauralSession(toggleBinauralBeat(binauralSession, type as any))}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                binauralSession?.isActive && binauralSession.type === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">{getBinauralDisclaimer()}</p>
      </div>

      {/* 81 & 82 - Guards (blocked) */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex gap-4 text-xs text-gray-400">
         <span title="Integração de hardware pendente">
            FLIR: {flir.status === 'blocked_external_dependency' ? 'Offline' : 'Online'}
         </span>
         <span title="Modo pesquisa apenas">
            HRV Cam: {hrv.status === 'blocked_external_dependency' ? 'Offline' : 'Online'}
         </span>
      </div>
    </div>
  );
};
