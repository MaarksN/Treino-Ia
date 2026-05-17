/**
 * Item 19 — Picture-in-Picture Service
 *
 * Exposes the existing mediaPipService PiP guard with a user-facing status API.
 * Does NOT create fake players or simulate PiP without real media.
 */

import {
  getPictureInPictureGuard,
  isPictureInPictureSupported,
  findPictureInPictureVideo,
  requestPictureInPictureForVideo,
  type PictureInPictureGuardResult,
} from '../mediaPipService';

export type PipAvailability = 'available' | 'unsupported' | 'no_media' | 'blocked';

export interface PipStatus {
  availability: PipAvailability;
  browserSupported: boolean;
  hasRealMedia: boolean;
  message: string;
}

export function getPipStatus(): PipStatus {
  const browserSupported = isPictureInPictureSupported();
  const video = findPictureInPictureVideo();
  const hasRealMedia = video !== null;

  if (!browserSupported) {
    return {
      availability: 'unsupported',
      browserSupported: false,
      hasRealMedia,
      message: 'Seu navegador não suporta Picture-in-Picture.',
    };
  }

  if (!hasRealMedia) {
    return {
      availability: 'no_media',
      browserSupported: true,
      hasRealMedia: false,
      message: 'Nenhum vídeo real encontrado na página. PiP só é ativado com mídia real.',
    };
  }

  return {
    availability: 'available',
    browserSupported: true,
    hasRealMedia: true,
    message: 'Vídeo real detectado. PiP disponível.',
  };
}

export async function activatePip(): Promise<PictureInPictureGuardResult> {
  return requestPictureInPictureForVideo();
}

export function getGuardResult(): PictureInPictureGuardResult {
  return getPictureInPictureGuard();
}

export const PIP_DISCLAIMER =
  'Picture-in-Picture só é ativado quando existe vídeo real na página e o navegador suporta a API. Nenhum player simulado é criado.';
