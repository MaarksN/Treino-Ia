export interface EquipmentReplanningState {
  isReady: boolean;
  hasSafeUploadFlow: boolean;
  status: 'upload_ready' | 'processing' | 'foundation_created';
}

/**
 * Item 58 - Replanejamento por foto de equipamentos
 * Creates safe upload flow/guard. No fake Gemini Vision.
 */
export function checkEquipmentReplanningGuard(): EquipmentReplanningState {
  return {
    isReady: false,
    hasSafeUploadFlow: true,
    status: 'foundation_created'
  };
}

export function validateSafeEquipmentPhotoUpload(fileSize: number, fileType: string): boolean {
  if (fileSize > 5 * 1024 * 1024) return false;
  if (!['image/jpeg', 'image/png'].includes(fileType)) return false;
  return true;
}
