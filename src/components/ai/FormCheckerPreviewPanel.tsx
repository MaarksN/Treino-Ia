import { useState, useRef, useCallback } from 'react';
import {
  getFormCheckerStatus,
  FORM_CHECKER_DISCLAIMER,
} from '../../services/ai/formCheckerCapabilityService';
import { InlineNotice } from '../ui/InlineNotice';
import { Camera, CameraOff, Loader2 } from 'lucide-react';

export function FormCheckerPreviewPanel() {
  const [status] = useState(() => getFormCheckerStatus());
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const toggleCamera = useCallback(async () => {
    if (isCameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
      return;
    }

    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.error('Failed to open camera:', err);
      alert('Nao foi possivel acessar a camera.');
    } finally {
      setLoading(false);
    }
  }, [isCameraActive]);

  return (
    <article
      className="rounded-[28px] border-2 border-brand-light/20 bg-brand-gray p-6"
      aria-labelledby="form-checker-title"
    >
      <h3 id="form-checker-title" className="font-display text-3xl uppercase text-brand-light">
        Análise de forma
      </h3>
      <p className="mt-1 font-mono text-xs text-brand-muted">
        Checklist de capabilities para análise de postura por câmera.
      </p>
      <ul className="mt-4 space-y-2" role="list">
        {status.capabilities.map((cap) => (
          <li
            key={cap.id}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${cap.status === 'available' ? 'border-brand-neon/30 bg-brand-neon/5' : 'border-brand-light/10 bg-brand-dark/30'}`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${cap.status === 'available' ? 'bg-brand-neon text-brand-dark' : cap.status === 'unknown' ? 'bg-brand-muted/30 text-brand-muted' : 'bg-brand-light/10 text-brand-muted'}`}
            >
              {cap.status === 'available' ? '✓' : cap.status === 'unknown' ? '?' : '✗'}
            </span>
            <div className="flex-1">
              <span className="font-mono text-sm font-bold text-brand-light">{cap.label}</span>
              <p className="font-mono text-[10px] text-brand-muted">{cap.description}</p>
            </div>
          </li>
        ))}
      </ul>
      {!status.canAnalyze && !isCameraActive && (
        <p className="mt-3 font-mono text-xs text-brand-magenta">{status.reason}</p>
      )}

      <div className="mt-6">
        {isCameraActive ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-4 border-brand-neon bg-brand-dark shadow-brutal-neon">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover grayscale brightness-50"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="h-4/5 w-1/3 border-2 border-brand-neon border-dashed rounded-full opacity-50 animate-pulse" />
              <p className="font-mono text-[10px] text-brand-neon uppercase mt-2">Alinhe seu corpo no guia</p>
            </div>
            <button
              onClick={toggleCamera}
              className="absolute bottom-4 right-4 rounded-full bg-brand-dark/80 p-2 text-brand-magenta hover:bg-brand-dark"
            >
              <CameraOff className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={toggleCamera}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-neon bg-transparent py-3 font-mono text-sm uppercase tracking-widest text-brand-neon hover:bg-brand-neon/10 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Camera className="h-5 w-5" />
                Ativar Analise em Tempo Real
              </>
            )}
          </button>
        )}
      </div>

      <InlineNotice type="warning" title="Sem engine real">
        {FORM_CHECKER_DISCLAIMER}
      </InlineNotice>
    </article>
  );
}
