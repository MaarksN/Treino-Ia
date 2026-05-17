export type CameraFeedbackGuardStatus =
  | 'available'
  | 'blocked_no_browser'
  | 'blocked_insecure_context'
  | 'blocked_no_camera_api'
  | 'blocked_missing_mediapipe';

export interface CameraFeedbackEnvironment {
  hasBrowser: boolean;
  isSecureContext: boolean;
  hasCameraApi: boolean;
  hasMediaPipePose: boolean;
}

export interface CameraFeedbackGuard {
  status: CameraFeedbackGuardStatus;
  canStart: boolean;
  reason: string;
}

type WindowWithMediaPipe = Window & {
  PoseLandmarker?: unknown;
};

export function getBrowserCameraFeedbackEnvironment(): CameraFeedbackEnvironment {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      hasBrowser: false,
      isSecureContext: false,
      hasCameraApi: false,
      hasMediaPipePose: false,
    };
  }

  const mediaPipeWindow = window as WindowWithMediaPipe;

  return {
    hasBrowser: true,
    isSecureContext: window.isSecureContext,
    hasCameraApi: Boolean(navigator.mediaDevices?.getUserMedia),
    hasMediaPipePose: Boolean(window.Pose || mediaPipeWindow.PoseLandmarker),
  };
}

export function getCameraFeedbackGuard(
  environment: CameraFeedbackEnvironment = getBrowserCameraFeedbackEnvironment(),
): CameraFeedbackGuard {
  if (!environment.hasBrowser) {
    return {
      status: 'blocked_no_browser',
      canStart: false,
      reason: 'Feedback por camera depende de APIs do navegador.',
    };
  }

  if (!environment.isSecureContext) {
    return {
      status: 'blocked_insecure_context',
      canStart: false,
      reason: 'A camera so pode ser acessada em contexto seguro.',
    };
  }

  if (!environment.hasCameraApi) {
    return {
      status: 'blocked_no_camera_api',
      canStart: false,
      reason: 'Este navegador nao expoe getUserMedia para camera.',
    };
  }

  if (!environment.hasMediaPipePose) {
    return {
      status: 'blocked_missing_mediapipe',
      canStart: false,
      reason: 'MediaPipe Pose nao esta carregado. Nenhum feedback tecnico sera simulado.',
    };
  }

  return {
    status: 'available',
    canStart: true,
    reason: 'Camera e MediaPipe Pose disponiveis para um adapter real.',
  };
}

export type AudioNoteGuardStatus = 'available' | 'blocked_no_browser' | 'unsupported';

export interface AudioNoteGuard {
  status: AudioNoteGuardStatus;
  canRecord: boolean;
  reason: string;
}

interface WindowWithMediaRecorder extends Window {
  MediaRecorder?: unknown;
}

export function getAudioNoteGuard(): AudioNoteGuard {
  if (typeof window === 'undefined') {
    return {
      status: 'blocked_no_browser',
      canRecord: false,
      reason: 'Notas em audio dependem do navegador.',
    };
  }

  const recorderWindow = window as WindowWithMediaRecorder;
  const hasAudioCaptureApi = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
  if (!recorderWindow.MediaRecorder || !hasAudioCaptureApi) {
    return {
      status: 'unsupported',
      canRecord: false,
      reason: 'Gravacao de audio indisponivel neste ambiente. Use nota em texto.',
    };
  }

  return {
    status: 'available',
    canRecord: true,
    reason: 'O navegador suporta gravacao real; UI de captura ainda fica atras de permissao explicita.',
  };
}
