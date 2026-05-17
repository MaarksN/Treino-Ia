export type PictureInPictureStatus =
  | 'available'
  | 'unsupported'
  | 'no_real_media'
  | 'blocked'
  | 'failed';

export interface PictureInPictureGuardResult {
  status: PictureInPictureStatus;
  canRenderControl: boolean;
  reason: string;
}

type DocumentWithExperimentalPip = Document & {
  documentPictureInPicture?: unknown;
};

type PipVideoElement = HTMLVideoElement & {
  requestPictureInPicture?: () => Promise<unknown>;
};

function hasSourceElement(video: HTMLVideoElement): boolean {
  return Array.from(video.querySelectorAll('source')).some(source => Boolean(source.getAttribute('src')?.trim()));
}

export function hasRealVideoMedia(video: HTMLVideoElement | null | undefined): boolean {
  if (!video) return false;
  return Boolean(video.currentSrc.trim() || video.src.trim() || hasSourceElement(video));
}

export function isPictureInPictureSupported(doc: Document = document): boolean {
  const experimentalDoc = doc as DocumentWithExperimentalPip;
  return Boolean(doc.pictureInPictureEnabled || experimentalDoc.documentPictureInPicture);
}

export function findPictureInPictureVideo(root: ParentNode = document): HTMLVideoElement | null {
  const videos = Array.from(root.querySelectorAll('video'));
  return videos.find(video => hasRealVideoMedia(video)) ?? null;
}

export function getPictureInPictureGuard(
  video: HTMLVideoElement | null = findPictureInPictureVideo(),
  doc: Document = document,
): PictureInPictureGuardResult {
  if (!isPictureInPictureSupported(doc)) {
    return {
      status: 'unsupported',
      canRenderControl: false,
      reason: 'Este navegador não expõe uma API de picture-in-picture compatível.',
    };
  }

  if (!hasRealVideoMedia(video)) {
    return {
      status: 'no_real_media',
      canRenderControl: false,
      reason: 'Nenhum vídeo real foi encontrado neste fluxo.',
    };
  }

  return {
    status: 'available',
    canRenderControl: true,
    reason: 'Vídeo real elegível para picture-in-picture.',
  };
}

export async function requestPictureInPictureForVideo(
  video: HTMLVideoElement | null = findPictureInPictureVideo(),
): Promise<PictureInPictureGuardResult> {
  const guard = getPictureInPictureGuard(video);
  if (!guard.canRenderControl || !video) return guard;

  const pipVideo = video as PipVideoElement;
  if (!pipVideo.requestPictureInPicture) {
    return {
      status: 'blocked',
      canRenderControl: false,
      reason: 'O elemento de vídeo não permite iniciar picture-in-picture.',
    };
  }

  try {
    await pipVideo.requestPictureInPicture();
    return {
      status: 'available',
      canRenderControl: true,
      reason: 'Picture-in-picture iniciado.',
    };
  } catch {
    return {
      status: 'failed',
      canRenderControl: true,
      reason: 'O navegador recusou iniciar picture-in-picture agora.',
    };
  }
}
