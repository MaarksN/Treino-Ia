import { describe, expect, it } from 'vitest';
import {
  buildWorkoutImportDraft,
  getWorkoutImportGuard,
  normalizeCropRect,
} from './workoutImportPipeline';

describe('workoutImportPipeline', () => {
  it('normaliza crop para percentuais validos', () => {
    expect(normalizeCropRect({ x: -10, y: 100, width: 200, height: 0 })).toEqual({
      x: 0,
      y: 99,
      width: 100,
      height: 1,
    });
  });

  it('aceita imagens e PDF sem iniciar OCR', () => {
    expect(getWorkoutImportGuard('image/png', 2000).status).toBe('ready');
    expect(getWorkoutImportGuard('application/pdf', 2000).status).toBe('ready');

    const draft = buildWorkoutImportDraft({
      fileName: 'ficha.png',
      mimeType: 'image/png',
      sizeBytes: 2000,
      base64: 'abc',
      crop: { x: 10, y: 20, width: 80, height: 70 },
    });

    expect(draft.ocrStatus).toBe('not_started');
    expect(draft.crop).toEqual({ x: 10, y: 20, width: 80, height: 70 });
  });

  it('bloqueia formatos fora da lista segura', () => {
    const guard = getWorkoutImportGuard('text/plain', 2000);

    expect(guard.status).toBe('blocked');
  });
});
