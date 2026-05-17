/**
 * Item 28 — Workout Import Service
 *
 * Wraps the existing workoutImportPipeline with a user-facing API
 * for file validation, metadata extraction, and import status tracking.
 * OCR remains guarded (not_started) until a real engine is integrated.
 */

import {
  getWorkoutImportGuard,
  isSupportedWorkoutImportMimeType,
  type WorkoutImportGuard,
} from '../workoutImportPipeline';

export interface FileMetadata {
  name: string;
  type: string;
  sizeBytes: number;
  sizeFormatted: string;
  isImage: boolean;
  isPdf: boolean;
  isSupported: boolean;
  guard: WorkoutImportGuard;
}

export function extractFileMetadata(file: { name: string; type: string; size: number }): FileMetadata {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  const isSupported = isSupportedWorkoutImportMimeType(file.type);
  const guard = getWorkoutImportGuard(file.type, file.size);

  return {
    name: file.name || 'arquivo',
    type: file.type || 'desconhecido',
    sizeBytes: file.size,
    sizeFormatted: formatBytes(file.size),
    isImage,
    isPdf,
    isSupported,
    guard,
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function validateImportFile(file: { name: string; type: string; size: number }): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!file.name.trim()) {
    errors.push('Nome do arquivo está vazio.');
  }

  if (!isSupportedWorkoutImportMimeType(file.type)) {
    errors.push(`Formato "${file.type || 'desconhecido'}" não é suportado. Use JPG, PNG, WebP ou PDF.`);
  }

  if (file.size > 12 * 1024 * 1024) {
    errors.push('Arquivo excede o limite de 12 MB.');
  }

  if (file.size === 0) {
    errors.push('Arquivo está vazio.');
  }

  return { valid: errors.length === 0, errors };
}

export const OCR_STATUS_MESSAGE =
  'OCR não está ativo neste lote. O arquivo fica preparado localmente para processamento futuro quando um engine real for integrado.';

export const IMPORT_DISCLAIMER =
  'A importação prepara o arquivo localmente com preview e crop. A leitura automática do treino (OCR) requer integração de engine externo que ainda não foi realizada.';
