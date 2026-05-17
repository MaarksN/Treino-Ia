import React, { useState } from 'react';
import { getFlirCapability, getHrvCapability } from '../../../services/biohacking/biohackingGuards';
import { toggleBinauralBeat, getBinauralDisclaimer, type BinauralBeatSession } from '../../../services/biohacking/binauralBeatsService';
import { generateRecoverySuggestion } from '../../../services/biohacking/recoverySuggestionsService';
import { assessChronotype, getTimeBasedSuggestion } from '../../../services/biohacking/chronobiologyService';
import { InlineNotice } from '../../../components/ui/InlineNotice';
import { Activity, Clock, Headphones, Thermometer, Radio } from 'lucide-react';

export const BiohackingWidget: React.FC = () => {
  const [binauralSession, setBinauralSession] = useState<BinauralBeatSession | null>(null);

  const flir = getFlirCapability();
  const hrv = getHrvCapability();

  const recovery = generateRecoverySuggestion({ rpe: 7, muscleSoreness: 5, exhaustionLevel: 'moderate' });
  const chronoProfile = assessChronotype(8); // user wakes up at 8 AM
  const chronoAlert = getTimeBasedSuggestion(chronoProfile, new Date().getHours());

  return (
    <div className="rounded-[24px] border-2 border-brand-light/10 bg-brand-dark p-6 mt-6 mb-6">
      <div className="flex items-center gap-3 mb-6 border-b border-brand-light/10 pb-4">
        <Activity className="h-6 w-6 text-brand-neon" />
        <h3 className="font-display text-3xl uppercase text-brand-light">Biohacking & Recovery</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 85 - Cronobiologia */}
        <div className="border border-brand-light/10 bg-brand-gray p-4 rounded-[16px]">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-brand-magenta" />
            <h4 className="font-mono text-xs uppercase tracking-widest text-brand-muted">Cronotipo</h4>
          </div>
          <p className="font-display text-2xl uppercase text-brand-light capitalize mb-2">{chronoProfile.chronotype.replace('_', ' ')}</p>
          <p className="font-mono text-[10px] leading-5 text-brand-light/70 uppercase tracking-wide">{chronoProfile.currentRecommendation}</p>
          {chronoAlert && <p className="font-mono text-[10px] mt-2 border border-brand-magenta/50 text-brand-magenta px-2 py-1 rounded bg-brand-magenta/10">{chronoAlert}</p>}
        </div>

        {/* 84 - Sugestão de Banho */}
        <div className="border border-brand-light/10 bg-brand-gray p-4 rounded-[16px]">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-4 w-4 text-brand-neon" />
            <h4 className="font-mono text-xs uppercase tracking-widest text-brand-muted">Recuperação</h4>
          </div>
          <p className="font-display text-xl uppercase text-brand-light mb-2">{recovery.description}</p>
          <p className="font-mono text-[9px] text-brand-light/50 italic">{recovery.disclaimer}</p>
        </div>
      </div>

      {/* 83 - Sons Binaurais */}
      <div className="mt-6 border border-brand-light/10 bg-brand-gray p-5 rounded-[16px]">
        <div className="flex items-center gap-2 mb-4">
          <Headphones className="h-5 w-5 text-brand-light" />
          <h4 className="font-display text-xl uppercase text-brand-light">Frequências Binaurais</h4>
        </div>
        <div className="flex flex-wrap gap-3">
          {['focus', 'relaxation', 'recovery'].map((type) => (
            <button
              key={type}
              onClick={() => setBinauralSession(toggleBinauralBeat(binauralSession, type as any))}
              className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest border-2 rounded-full transition-all ${
                binauralSession?.isActive && binauralSession.type === type
                  ? 'border-brand-neon bg-brand-neon text-brand-dark font-bold'
                  : 'border-brand-light/20 text-brand-light/70 hover:border-brand-neon hover:text-brand-neon'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <InlineNotice type="info" title="Aviso">
          {getBinauralDisclaimer()}
        </InlineNotice>
      </div>

      {/* 81 & 82 - Guards (blocked) */}
      <div className="mt-6 pt-4 border-t border-brand-light/10 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest text-brand-muted">
         <span className="flex items-center gap-2" title="Integração de hardware pendente">
            <Radio className="h-3 w-3" />
            FLIR: {flir.status === 'blocked_external_dependency' ? 'Offline (Guard)' : 'Online'}
         </span>
         <span className="flex items-center gap-2" title="Modo pesquisa apenas">
            <Radio className="h-3 w-3" />
            HRV Cam: {hrv.status === 'blocked_external_dependency' ? 'Offline (Guard)' : 'Online'}
         </span>
      </div>
    </div>
  );
};
