import React, { useRef, useState } from 'react';
import { Copy, Download, Share2, X } from 'lucide-react';
import { StreakData, WorkoutHistoryEntry } from '../types';
import { createWorkoutSharePost } from '../services/socialService';

interface Props {
  entry: WorkoutHistoryEntry;
  streak: StreakData;
  userName?: string;
  onClose: () => void;
}

const CARD_THEMES = {
  dark: {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1917 50%, #0d1107 100%)',
    accent: '#a3e635',
    text: '#ffffff',
    sub: '#9ca3af',
    border: 'rgba(163,230,53,0.3)',
  },
  fire: {
    bg: 'linear-gradient(135deg, #0f0500 0%, #3b1200 50%, #1a0000 100%)',
    accent: '#f97316',
    text: '#ffffff',
    sub: '#fb923c',
    border: 'rgba(249,115,22,0.4)',
  },
  ocean: {
    bg: 'linear-gradient(135deg, #010f18 0%, #041e2f 50%, #010a18 100%)',
    accent: '#22d3ee',
    text: '#ffffff',
    sub: '#67e8f9',
    border: 'rgba(34,211,238,0.3)',
  },
  neon: {
    bg: 'linear-gradient(135deg, #050008 0%, #12001c 50%, #00040f 100%)',
    accent: '#e879f9',
    text: '#ffffff',
    sub: '#c084fc',
    border: 'rgba(232,121,249,0.4)',
  },
  gold: {
    bg: 'linear-gradient(135deg, #080500 0%, #2d1800 50%, #1a1000 100%)',
    accent: '#fbbf24',
    text: '#ffffff',
    sub: '#fde68a',
    border: 'rgba(251,191,36,0.4)',
  },
  minimal: {
    bg: 'linear-gradient(135deg, #020617 0%, #1e293b 100%)',
    accent: '#f1f5f9',
    text: '#ffffff',
    sub: '#94a3b8',
    border: 'rgba(241,245,249,0.2)',
  },
};

type CardTheme = keyof typeof CARD_THEMES;

type CanvasWindow = Window & {
  html2canvas?: (
    element: HTMLElement,
    options?: { backgroundColor?: string | null; scale?: number; useCORS?: boolean }
  ) => Promise<HTMLCanvasElement>;
};

function buildShareText(entry: WorkoutHistoryEntry, streak: StreakData) {
  return [
    `Treino concluído: ${entry.planName}`,
    `Data: ${entry.date}`,
    `Exercícios: ${entry.completedCount}/${entry.exerciseCount}`,
    `Volume: ${entry.totalVolume}kg`,
    `Streak: ${streak.currentStreak} dias`,
    '',
    'Gerado pelo Treino App',
  ].join('\n');
}

export function WorkoutShareCard({ entry, streak, userName = 'Atleta', onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<CardTheme>('dark');
  const [status, setStatus] = useState('');
  const [rendering, setRendering] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const themeConfig = CARD_THEMES[theme];

  const renderCardCanvas = async (scale = 2) => {
    if (!cardRef.current) return null;
    const html2canvas = (window as CanvasWindow).html2canvas;
    if (!html2canvas) return null;

    return html2canvas(cardRef.current, {
      backgroundColor: null,
      scale,
      useCORS: true,
    });
  };

  const handleCopyImage = async () => {
    setRendering(true);
    setStatus('');

    try {
      const canvas = await renderCardCanvas(2);
      if (!canvas) {
        await navigator.clipboard?.writeText(buildShareText(entry, streak));
        setStatus('Texto copiado. Imagem indisponível neste navegador.');
        return;
      }

      canvas.toBlob(async blob => {
        if (!blob || !navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
          await navigator.clipboard?.writeText(buildShareText(entry, streak));
          setStatus('Texto copiado. Clipboard de imagem indisponível.');
          return;
        }

        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setStatus('Imagem copiada.');
      }, 'image/png');
    } catch {
      setStatus('Não foi possível copiar agora.');
    } finally {
      setRendering(false);
    }
  };

  const handleShare = async () => {
    const text = buildShareText(entry, streak);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Meu treino de hoje', text });
      } else {
        await navigator.clipboard?.writeText(text);
        setStatus('Texto copiado para compartilhar.');
      }
    } catch {
      setStatus('Compartilhamento cancelado.');
    }
  };

  const handleDownload = async () => {
    setRendering(true);
    setStatus('');

    try {
      const canvas = await renderCardCanvas(3);
      if (!canvas) {
        setStatus('html2canvas não carregou. Tente novamente em instantes.');
        return;
      }

      const link = document.createElement('a');
      link.download = `treino-${entry.date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      setStatus('Não foi possível salvar a imagem.');
    } finally {
      setRendering(false);
    }
  };

  const handlePublishToFeed = async () => {
    setPublishing(true);
    setStatus('');

    try {
      await createWorkoutSharePost(entry, streak);
      setStatus(entry.prsBroken?.length ? 'PR publicado no feed.' : 'Treino publicado no feed.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível publicar no feed.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4 print:hidden">
      <div className="w-full max-w-sm">
        <div
          ref={cardRef}
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: themeConfig.bg,
            border: `1px solid ${themeConfig.border}`,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${themeConfig.accent}22 0%, transparent 70%)`,
            }}
          />

          <div className="flex justify-between items-start mb-4" style={{ position: 'relative' }}>
            <div>
              <p style={{ color: themeConfig.accent, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
                TREINO CONCLUÍDO
              </p>
              <p style={{ color: themeConfig.text, fontSize: 22, fontWeight: 900, marginTop: 2 }}>{userName}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: themeConfig.sub, fontSize: 12 }}>{entry.date}</p>
              <p style={{ color: themeConfig.accent, fontSize: 28, fontWeight: 900, lineHeight: 1 }}>
                {streak.currentStreak}
              </p>
              <p style={{ color: themeConfig.sub, fontSize: 10 }}>dias streak</p>
            </div>
          </div>

          <div
            style={{
              background: `${themeConfig.accent}15`,
              border: `1px solid ${themeConfig.border}`,
              borderRadius: 12,
              padding: '8px 16px',
              marginBottom: 16,
            }}
          >
            <p style={{ color: themeConfig.accent, fontWeight: 800, fontSize: 16 }}>{entry.dayFocus || entry.planName}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Exercícios', val: `${entry.completedCount}/${entry.exerciseCount}` },
              { label: 'Volume', val: entry.totalVolume > 0 ? `${entry.totalVolume}kg` : '—' },
              { label: 'Duração', val: entry.durationMinutes ? `${entry.durationMinutes}min` : '—' },
            ].map(({ label, val }) => (
              <div
                key={label}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 10,
                  padding: '8px 4px',
                  textAlign: 'center',
                  minWidth: 0,
                }}
              >
                <p style={{ color: themeConfig.text, fontWeight: 800, fontSize: 18, overflowWrap: 'anywhere' }}>{val}</p>
                <p style={{ color: themeConfig.sub, fontSize: 10, marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>

          {entry.prsBroken && entry.prsBroken.length > 0 && (
            <div
              style={{
                background: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.3)',
                borderRadius: 10,
                padding: '6px 12px',
                marginBottom: 12,
              }}
            >
              <p style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700 }}>
                PR batido: {entry.prsBroken.slice(0, 2).join(', ')}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: themeConfig.sub, fontSize: 10 }}>via Treino App</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {['🔥', '💪', '⚡'].map(item => (
                <span key={item} style={{ fontSize: 16 }}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {(Object.keys(CARD_THEMES) as CardTheme[]).map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setTheme(item)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${theme === item ? 'scale-110 border-white' : 'border-transparent opacity-60'}`}
              style={{ background: CARD_THEMES[item].accent }}
              title={item}
              aria-label={`Tema ${item}`}
            />
          ))}
        </div>

        {status && (
          <p className="mt-3 text-center text-xs font-mono text-brand-light bg-brand-gray border border-white/10 rounded-xl px-3 py-2">
            {status}
          </p>
        )}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 bg-brand-neon text-brand-dark font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <Share2 size={16} /> Compartilhar
          </button>
          <button
            type="button"
            onClick={handlePublishToFeed}
            disabled={publishing}
            className="flex-1 bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Share2 size={16} /> Feed
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={rendering}
            className="flex-1 bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download size={16} /> Salvar
          </button>
          <button
            type="button"
            onClick={handleCopyImage}
            disabled={rendering}
            className="px-3 bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl disabled:opacity-50"
            aria-label="Copiar imagem"
            title="Copiar imagem"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl"
            aria-label="Fechar"
            title="Fechar"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
