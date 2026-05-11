import React, { useState } from 'react';
import { Flag, Send, X } from 'lucide-react';
import { SocialReportReason, SocialReportTargetType } from '../types';
import { reportContent } from '../services/socialService';

interface Props {
  targetType: SocialReportTargetType;
  targetId: string;
  canInteract?: boolean;
  onAuthRequired?: () => void;
}

const REASONS: Array<{ value: SocialReportReason; label: string }> = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Assédio' },
  { value: 'hate', label: 'Ódio/discriminação' },
  { value: 'sexual_content', label: 'Conteúdo sexual' },
  { value: 'violence', label: 'Violência' },
  { value: 'self_harm', label: 'Autoagressão' },
  { value: 'illegal_activity', label: 'Atividade ilegal' },
  { value: 'privacy', label: 'Privacidade/dados pessoais' },
  { value: 'misinformation', label: 'Informação falsa perigosa' },
  { value: 'other', label: 'Outro' },
];

export function SocialReportButton({ targetType, targetId, canInteract = true, onAuthRequired }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<SocialReportReason>('spam');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const startReport = () => {
    if (!canInteract) {
      setStatus('Entre com Supabase Auth para denunciar conteúdo.');
      onAuthRequired?.();
      return;
    }

    setStatus('');
    setOpen(true);
  };

  const submit = async () => {
    setSubmitting(true);
    setStatus('');

    try {
      await reportContent({ targetType, targetId, reason, details });
      setDetails('');
      setOpen(false);
      setStatus('Denúncia enviada para moderação.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível enviar a denúncia.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={startReport}
        className="text-white/60 hover:text-yellow-300 flex items-center gap-2"
        title="Denunciar conteúdo"
      >
        <Flag size={16} />
        Denunciar
      </button>

      {status && <p className="mt-2 text-xs text-yellow-300">{status}</p>}

      {open && (
        <div className="mt-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm font-bold text-white">Denunciar conteúdo</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white"
              aria-label="Fechar denúncia"
              title="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          <select
            value={reason}
            onChange={event => setReason(event.target.value as SocialReportReason)}
            className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
          >
            {REASONS.map(item => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <textarea
            value={details}
            onChange={event => setDetails(event.target.value)}
            placeholder="Contexto opcional para a equipe de moderação"
            className="mt-2 w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-white outline-none min-h-20"
            maxLength={1000}
          />

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="mt-2 bg-brand-neon text-brand-dark rounded-xl px-3 py-2 font-black flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={14} />
            Enviar denúncia
          </button>
        </div>
      )}
    </div>
  );
}
