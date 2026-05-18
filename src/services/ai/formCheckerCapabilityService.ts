/**
 * Item 51 — Form Checker Capability Service
 *
 * Detects camera availability and MediaPipe/WASM engine presence.
 * Does NOT analyze video without a real engine.
 * Does NOT promise posture correction.
 */

export interface FormCheckerCapability {
  id: string;
  label: string;
  status: 'available' | 'unavailable' | 'unknown';
  description: string;
}

export interface FormCheckerStatus {
  capabilities: FormCheckerCapability[];
  canAnalyze: boolean;
  reason: string;
}

type GlobalWithMediaPipe = typeof globalThis & {
  __TREINO_IA_MEDIAPIPE_FORM_ENGINE__?: unknown;
  MediaPipe?: unknown;
  PoseLandmarker?: unknown;
  FilesetResolver?: unknown;
};

export function hasCameraSupport(): boolean {
  if (typeof navigator === 'undefined') return false;
  return Boolean(navigator.mediaDevices?.getUserMedia);
}

export function hasMediaPipeEngine(): boolean {
  const runtime = globalThis as GlobalWithMediaPipe;
  return Boolean(
    runtime.__TREINO_IA_MEDIAPIPE_FORM_ENGINE__ ||
      runtime.MediaPipe ||
      runtime.PoseLandmarker ||
      runtime.FilesetResolver,
  );
}

export function getFormCheckerCapabilities(): FormCheckerCapability[] {
  const camera = hasCameraSupport();
  const engine = hasMediaPipeEngine();

  return [
    {
      id: 'camera',
      label: 'Câmera',
      status: camera ? 'available' : 'unavailable',
      description: camera
        ? 'API de câmera detectada no navegador.'
        : 'Câmera não disponível neste navegador ou dispositivo.',
    },
    {
      id: 'camera_permission',
      label: 'Permissão de câmera',
      status: 'unknown',
      description: 'Permissão será solicitada apenas quando o engine estiver disponível.',
    },
    {
      id: 'mediapipe',
      label: 'Engine MediaPipe/WASM',
      status: engine ? 'available' : 'unavailable',
      description: engine
        ? 'MediaPipe/WASM detectado no runtime.'
        : 'MediaPipe não está instalado neste projeto. Análise de forma indisponível.',
    },
    {
      id: 'processing',
      label: 'Processamento local',
      status: engine ? 'available' : 'unavailable',
      description: engine
        ? 'Processamento ocorre localmente no dispositivo.'
        : 'Processamento local requer engine MediaPipe/WASM.',
    },
  ];
}

export function getFormCheckerStatus(): FormCheckerStatus {
  const capabilities = getFormCheckerCapabilities();
  const cameraAvailable = capabilities.find(c => c.id === 'camera')?.status === 'available';
  const engineAvailable = capabilities.find(c => c.id === 'mediapipe')?.status === 'available';
  const canAnalyze = cameraAvailable && engineAvailable;

  return {
    capabilities,
    canAnalyze,
    reason: canAnalyze
      ? 'Câmera e engine detectados. A permissão de câmera ainda deve ser solicitada antes de iniciar qualquer análise.'
      : 'Análise de forma indisponível. Engine MediaPipe/WASM precisa ser integrado ao projeto.',
  };
}

export const FORM_CHECKER_DISCLAIMER =
  'A análise de forma é uma estimativa educativa baseada em pontos corporais detectados por câmera. Não substitui avaliação presencial de um profissional de educação física. Nenhuma análise de vídeo é realizada sem engine real instalado.';
