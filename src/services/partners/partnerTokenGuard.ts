export interface PartnerTokenGuardResponse {
  isBlocked: boolean;
  message: string;
}

/**
 * Guard to verify if physical partner integration (QR Codes, real-world value tokens) is active.
 * Currently, it explicitly blocks fake token generation to comply with safe product rules.
 */
export function checkPartnerTokenAvailability(): PartnerTokenGuardResponse {
  return {
    isBlocked: true,
    message: 'Tokens reais via QR Code exigem backend e parceria física validada. Recurso atualmente bloqueado para evitar promessas de benefícios não existentes.',
  };
}
