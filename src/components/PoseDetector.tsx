import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, CameraOff, CheckCircle } from 'lucide-react';
import { BiometricPersistenceMeta, PoseAnalysis } from '../types';
import { PremiumFeatureGate } from './PremiumPaywall';
import {
  analyzeAngles,
  EXERCISE_RULES,
  ExerciseRule,
  loadPoseAnalyses,
  savePoseAnalysis,
} from '../services/poseService';

type PoseLandmark = { x: number; y: number; z?: number; visibility?: number };
type PoseResults = { image: CanvasImageSource; poseLandmarks?: PoseLandmark[] };

type MediaPipePose = {
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (callback: (results: PoseResults) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  close: () => void;
};

type MediaPipeCamera = {
  start: () => void;
  stop?: () => void;
};

declare global {
  interface Window {
    Pose?: new (options: { locateFile: (file: string) => string }) => MediaPipePose;
    Camera?: new (
      video: HTMLVideoElement,
      options: { onFrame: () => Promise<void>; width: number; height: number }
    ) => MediaPipeCamera;
    drawConnectors?: (
      context: CanvasRenderingContext2D,
      landmarks: PoseLandmark[],
      connections: unknown,
      options: { color: string; lineWidth: number }
    ) => void;
    drawLandmarks?: (
      context: CanvasRenderingContext2D,
      landmarks: PoseLandmark[],
      options: { color: string; fillColor: string; radius: number }
    ) => void;
    POSE_CONNECTIONS?: unknown;
  }
}

const MEDIAPIPE_SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
];

function getScoreColor(score: number) {
  if (score >= 80) return '#a3e635';
  if (score >= 60) return '#fbbf24';
  return '#ef4444';
}

export function PoseDetector() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<MediaPipePose | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const repPhaseRef = useRef<'down' | 'up'>('up');

  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ExerciseRule>(EXERCISE_RULES[0]);
  const [formScore, setFormScore] = useState(100);
  const [issues, setIssues] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [keyAngles, setKeyAngles] = useState<Record<string, number>>({});
  const [repCount, setRepCount] = useState(0);
  const [analyses, setAnalyses] = useState<PoseAnalysis[]>(loadPoseAnalyses);
  const [tab, setTab] = useState<'camera' | 'history'>('camera');
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (window.Pose && window.Camera && window.drawConnectors && window.drawLandmarks) {
      setScriptsLoaded(true);
      return;
    }

    let loaded = 0;
    MEDIAPIPE_SCRIPTS.forEach(src => {
      const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
      if (existing?.dataset.loaded === 'true') {
        loaded += 1;
        if (loaded === MEDIAPIPE_SCRIPTS.length) setScriptsLoaded(true);
        return;
      }

      const script = existing || document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        script.dataset.loaded = 'true';
        loaded += 1;
        if (loaded === MEDIAPIPE_SCRIPTS.length) setScriptsLoaded(true);
      };
      script.onerror = () => setError('Não foi possível carregar o MediaPipe.');
      if (!existing) document.head.appendChild(script);
    });
  }, []);

  const stopCamera = useCallback(() => {
    cameraRef.current?.stop?.();
    cameraRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    poseRef.current?.close();
    poseRef.current = null;
    setActive(false);
    setRepCount(0);
    repPhaseRef.current = 'up';
  }, []);

  useEffect(() => () => {
    stopCamera();
  }, [stopCamera]);

  const onResults = useCallback((results: PoseResults) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.videoWidth === 0 || video.videoHeight === 0) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (!results.poseLandmarks) return;

    const analysis = analyzeAngles(results.poseLandmarks, selectedRule);
    setFormScore(analysis.formScore);
    setIssues(analysis.issues);
    setTips(analysis.tips);
    setKeyAngles(analysis.keyAngles);

    const color = getScoreColor(analysis.formScore);

    if (window.drawConnectors && window.POSE_CONNECTIONS) {
      window.drawConnectors(context, results.poseLandmarks, window.POSE_CONNECTIONS, { color, lineWidth: 3 });
    }
    if (window.drawLandmarks) {
      window.drawLandmarks(context, results.poseLandmarks, { color: '#ffffff', fillColor: color, radius: 5 });
    }

    const repAngle = analysis.keyAngles.Joelho || analysis.keyAngles['Cotovelo na subida'];
    if (repAngle) {
      if (repAngle < 100 && repPhaseRef.current === 'up') {
        repPhaseRef.current = 'down';
      } else if (repAngle > 150 && repPhaseRef.current === 'down') {
        repPhaseRef.current = 'up';
        setRepCount(count => count + 1);
      }
    }

    Object.entries(analysis.keyAngles).forEach(([label, angle], index) => {
      const landmarkIndex = selectedRule.keyAngles[index]?.landmarkIndices[1];
      const landmark = results.poseLandmarks?.[landmarkIndex];
      if (!landmark) return;

      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height - 10;
      context.fillStyle = 'rgba(0,0,0,0.7)';
      context.fillRect(x - 34, y - 18, 84, 22);
      context.fillStyle = color;
      context.font = 'bold 12px system-ui';
      context.fillText(`${label}: ${angle}°`, x - 30, y - 2);
    });
  }, [selectedRule]);

  const startCamera = async () => {
    if (!scriptsLoaded || !window.Pose || !window.Camera) {
      setError('Aguarde os scripts do MediaPipe carregarem.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const pose = new window.Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      pose.onResults(onResults);
      poseRef.current = pose;

      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && poseRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      cameraRef.current = camera;
      camera.start();
      setActive(true);
    } catch (err) {
      setError(err instanceof Error ? `Permissão de câmera negada ou erro: ${err.message}` : 'Permissão de câmera negada.');
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = () => {
    const analysis: PoseAnalysis = {
      id: crypto.randomUUID(),
      exerciseName: selectedRule.name,
      date: new Date().toISOString().slice(0, 10),
      repCount,
      formScore,
      issues,
      tips,
      keyAngles,
      thumbnail: canvasRef.current?.toDataURL('image/jpeg', 0.7),
    };
    savePoseAnalysis(analysis);
    setAnalyses(loadPoseAnalyses());
  };

  const scoreColor = getScoreColor(formScore);

  return (
    <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Análise de Forma</h3>
        <Camera size={20} className="text-brand-muted" />
      </div>

      <PremiumFeatureGate feature="pose_detection">
      <div className="flex gap-2 mb-4">
        {(['camera', 'history'] as const).map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${tab === item ? 'bg-brand-neon text-brand-dark' : 'bg-white/10 text-brand-muted'}`}
          >
            {item === 'camera' ? 'Câmera' : 'Histórico'}
          </button>
        ))}
      </div>

      {tab === 'camera' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-brand-muted mb-2">Exercício analisado</p>
            <div className="flex gap-2 flex-wrap">
              {EXERCISE_RULES.map(rule => (
                <button
                  key={rule.name}
                  type="button"
                  onClick={() => setSelectedRule(rule)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    selectedRule.name === rule.name
                      ? 'bg-brand-neon text-brand-dark border-brand-neon'
                      : 'bg-brand-dark text-brand-muted border-white/10 hover:border-white/20'
                  }`}
                >
                  {rule.name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10" style={{ aspectRatio: '4 / 3' }}>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-0" playsInline muted />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
            {!active && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <CameraOff size={40} className="text-brand-muted mx-auto mb-2" />
                  <p className="text-brand-muted text-sm">Câmera inativa</p>
                </div>
              </div>
            )}
            {active && (
              <>
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-black/60 rounded-full px-3 py-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white text-xs font-bold">AO VIVO</span>
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <div className="bg-black/70 rounded-xl px-3 py-2 text-center">
                    <p className="text-2xl font-black" style={{ color: scoreColor }}>{formScore}</p>
                    <p className="text-white/60 text-xs">Form Score</p>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="bg-black/70 rounded-xl px-4 py-2 text-center">
                    <p className="text-3xl font-black text-brand-neon tabular-nums">{repCount}</p>
                    <p className="text-white/60 text-xs">Reps</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-2">
            {!active ? (
              <button
                type="button"
                onClick={startCamera}
                disabled={loading}
                className="flex-1 py-3 bg-brand-neon text-brand-dark font-black rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Camera size={16} />
                {loading ? 'Iniciando...' : 'Iniciar análise'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex-1 py-3 bg-red-500/20 border border-red-500/40 text-red-400 font-bold rounded-xl text-sm"
                >
                  Parar
                </button>
                <button
                  type="button"
                  onClick={saveAnalysis}
                  className="flex-1 py-3 bg-brand-neon/10 border border-brand-neon/30 text-brand-neon font-bold rounded-xl text-sm"
                >
                  Salvar análise
                </button>
              </>
            )}
          </div>

          {active && (
            <div className="space-y-2">
              {Object.keys(keyAngles).length > 0 && (
                <div className="p-3 bg-brand-dark rounded-xl border border-white/10">
                  <p className="text-xs text-brand-muted mb-2 uppercase tracking-widest">Ângulos detectados</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(keyAngles).map(([label, angle]) => (
                      <div key={label} className="text-center">
                        <p className="text-brand-neon font-black text-xl tabular-nums">{angle}°</p>
                        <p className="text-brand-muted text-xs">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {issues.length > 0 ? (
                <div className="p-3 bg-red-500/5 border border-red-500/30 rounded-xl space-y-2">
                  {issues.map((issue, index) => (
                    <div key={issue} className="flex items-start gap-2">
                      <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 text-xs font-semibold">{issue}</p>
                        {tips[index] && <p className="text-white/70 text-xs mt-0.5">{tips[index]}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : formScore >= 80 ? (
                <div className="p-3 bg-green-500/5 border border-green-500/30 rounded-xl flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <p className="text-green-400 text-sm font-semibold">Forma excelente. Continue assim.</p>
                </div>
              ) : null}
            </div>
          )}

          <p className="text-xs text-brand-muted text-center">
            Requer Chrome/Edge · Câmera frontal recomendada · Posicione o corpo inteiro no quadro
          </p>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {analyses.length === 0 && (
            <p className="text-brand-muted text-sm text-center py-6">Nenhuma análise salva ainda.</p>
          )}
          {[...analyses].reverse().slice(0, 15).map(analysis => (
            <div key={analysis.id} className="p-4 bg-brand-dark rounded-xl border border-white/10">
              <div className="flex justify-between items-start gap-3 mb-2">
                <div>
                  <p className="text-white font-semibold text-sm">{analysis.exerciseName}</p>
                  <p className="text-brand-muted text-xs">{analysis.date} · {analysis.repCount} reps</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black tabular-nums" style={{ color: getScoreColor(analysis.formScore) }}>
                    {analysis.formScore}
                  </p>
                  <p className="text-brand-muted text-xs">Form Score</p>
                </div>
              </div>
              {analysis.issues.length > 0 && (
                <div className="mt-2 space-y-1">
                  {analysis.issues.map(issue => (
                    <p key={issue} className="text-xs text-red-400">⚠️ {issue}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </PremiumFeatureGate>
    </div>
  );
}
