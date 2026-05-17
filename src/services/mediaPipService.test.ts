import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  findPictureInPictureVideo,
  getPictureInPictureGuard,
  hasRealVideoMedia,
  isPictureInPictureSupported,
  requestPictureInPictureForVideo,
} from './mediaPipService';

function setPipSupport(enabled: boolean) {
  Object.defineProperty(document, 'pictureInPictureEnabled', {
    configurable: true,
    value: enabled,
  });
}

describe('mediaPipService', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    setPipSupport(false);
  });

  it('nao libera controle PiP sem suporte do navegador', () => {
    setPipSupport(false);

    expect(isPictureInPictureSupported()).toBe(false);
    expect(getPictureInPictureGuard().status).toBe('unsupported');
  });

  it('nao libera controle PiP sem video real', () => {
    setPipSupport(true);
    const video = document.createElement('video');

    expect(hasRealVideoMedia(video)).toBe(false);
    expect(getPictureInPictureGuard(video).status).toBe('no_real_media');
  });

  it('encontra video com fonte real', () => {
    setPipSupport(true);
    const video = document.createElement('video');
    video.src = 'https://example.com/exercise.mp4';
    document.body.append(video);

    expect(findPictureInPictureVideo()).toBe(video);
    expect(getPictureInPictureGuard(video)).toMatchObject({
      status: 'available',
      canRenderControl: true,
    });
  });

  it('solicita picture-in-picture somente quando o video suporta a API', async () => {
    setPipSupport(true);
    const video = document.createElement('video') as HTMLVideoElement & {
      requestPictureInPicture: () => Promise<unknown>;
    };
    video.src = 'https://example.com/exercise.mp4';
    video.requestPictureInPicture = vi.fn().mockResolvedValue({});

    const result = await requestPictureInPictureForVideo(video);

    expect(result.status).toBe('available');
    expect(video.requestPictureInPicture).toHaveBeenCalledTimes(1);
  });
});
