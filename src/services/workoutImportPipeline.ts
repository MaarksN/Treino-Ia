export type WorkoutImportStatus = 'ready' | 'blocked';
export type WorkoutImportOcrStatus = 'not_started';

export interface CropRectPercent {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorkoutImportGuard {
  status: WorkoutImportStatus;
  reason: string;
}

export interface WorkoutImportFileDraft {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  base64: string;
  crop: CropRectPercent;
  croppedImageDataUrl?: string;
  status: WorkoutImportStatus;
  ocrStatus: WorkoutImportOcrStatus;
  warnings: string[];
}

export const DEFAULT_WORKOUT_IMPORT_CROP: CropRectPercent = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const MAX_IMPORT_FILE_BYTES = 12 * 1024 * 1024;

function clampPercent(value: unknown, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

export function isSupportedWorkoutImportMimeType(mimeType: string): boolean {
  return SUPPORTED_MIME_TYPES.has(mimeType);
}

export function normalizeCropRect(crop: Partial<CropRectPercent> | null | undefined): CropRectPercent {
  const x = Math.min(99, clampPercent(crop?.x, DEFAULT_WORKOUT_IMPORT_CROP.x));
  const y = Math.min(99, clampPercent(crop?.y, DEFAULT_WORKOUT_IMPORT_CROP.y));
  const width = Math.max(1, clampPercent(crop?.width, DEFAULT_WORKOUT_IMPORT_CROP.width));
  const height = Math.max(1, clampPercent(crop?.height, DEFAULT_WORKOUT_IMPORT_CROP.height));

  return {
    x,
    y,
    width: Math.min(width, 100 - x || 1),
    height: Math.min(height, 100 - y || 1),
  };
}

export function getWorkoutImportGuard(mimeType: string, sizeBytes: number): WorkoutImportGuard {
  if (!isSupportedWorkoutImportMimeType(mimeType)) {
    return {
      status: 'blocked',
      reason: 'Formato nao suportado. Use imagem JPG, PNG, WebP ou PDF.',
    };
  }

  if (sizeBytes > MAX_IMPORT_FILE_BYTES) {
    return {
      status: 'blocked',
      reason: 'Arquivo maior que 12 MB. Reduza ou recorte antes de importar.',
    };
  }

  return {
    status: 'ready',
    reason: 'Arquivo aceito para preparo local com crop. OCR nao sera executado neste lote.',
  };
}

export function buildWorkoutImportDraft(params: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  base64: string;
  crop?: Partial<CropRectPercent>;
  croppedImageDataUrl?: string | null;
}): WorkoutImportFileDraft {
  const guard = getWorkoutImportGuard(params.mimeType, params.sizeBytes);
  const warnings = [
    'OCR nao implementado neste lote; o arquivo fica preparado para uma etapa real posterior.',
  ];

  if (params.mimeType === 'application/pdf') {
    warnings.push('PDF recebe crop como metadado local; rasterizacao de pagina nao foi simulada.');
  }

  return {
    fileName: params.fileName,
    mimeType: params.mimeType,
    sizeBytes: params.sizeBytes,
    base64: params.base64,
    crop: normalizeCropRect(params.crop),
    croppedImageDataUrl: params.croppedImageDataUrl ?? undefined,
    status: guard.status,
    ocrStatus: 'not_started',
    warnings: guard.status === 'blocked' ? [guard.reason, ...warnings] : warnings,
  };
}

export async function cropImageDataUrl(
  dataUrl: string,
  crop: CropRectPercent,
): Promise<string | null> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') return null;

  const normalizedCrop = normalizeCropRect(crop);

  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => {
      const sourceX = Math.round((normalizedCrop.x / 100) * image.width);
      const sourceY = Math.round((normalizedCrop.y / 100) * image.height);
      const sourceWidth = Math.max(1, Math.round((normalizedCrop.width / 100) * image.width));
      const sourceHeight = Math.max(1, Math.round((normalizedCrop.height / 100) * image.height));
      const canvas = document.createElement('canvas');

      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      canvas
        .getContext('2d')
        ?.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => resolve(null);
    image.src = dataUrl;
  });
}
