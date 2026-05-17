import { describe, expect, it } from 'vitest';
import { getCameraFeedbackGuard } from './workoutCameraFeedbackService';

describe('workoutCameraFeedbackService', () => {
  it('bloqueia camera quando MediaPipe nao esta disponivel', () => {
    const guard = getCameraFeedbackGuard({
      hasBrowser: true,
      isSecureContext: true,
      hasCameraApi: true,
      hasMediaPipePose: false,
    });

    expect(guard.canStart).toBe(false);
    expect(guard.status).toBe('blocked_missing_mediapipe');
  });

  it('libera somente quando camera e MediaPipe existem', () => {
    const guard = getCameraFeedbackGuard({
      hasBrowser: true,
      isSecureContext: true,
      hasCameraApi: true,
      hasMediaPipePose: true,
    });

    expect(guard.canStart).toBe(true);
    expect(guard.status).toBe('available');
  });
});
