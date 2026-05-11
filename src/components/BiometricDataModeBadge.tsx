import React from 'react';
import { ShieldCheck, TriangleAlert } from 'lucide-react';
import { BiometricPersistenceMeta } from '../types';

interface Props {
  meta: BiometricPersistenceMeta | null;
}

export function BiometricDataModeBadge({ meta }: Props) {
  if (!meta) return null;

  const isMock = meta.dataMode === 'mock_dev_only';

  return (
    <div
      className={`mb-4 rounded-xl border px-3 py-2 text-xs flex items-start gap-2 ${
        isMock
          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
          : 'bg-brand-neon/10 border-brand-neon/30 text-brand-neon'
      }`}
      role="status"
    >
      {isMock ? <TriangleAlert size={14} className="mt-0.5 flex-shrink-0" /> : <ShieldCheck size={14} className="mt-0.5 flex-shrink-0" />}
      <span>
        {isMock
          ? `dataMode: "mock_dev_only" - ${meta.reason || 'persistencia local temporaria.'}`
          : 'Dados sincronizados com Supabase e protegidos por RLS.'}
      </span>
    </div>
  );
}
