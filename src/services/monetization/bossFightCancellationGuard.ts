export interface BossFightCancellationGuardResponse {
  isSafe: boolean;
  message: string;
}

/**
 * Guard to ensure that "Boss Fight Cancellation" remains a conceptual, ethical preview.
 * It strictly enforces that real cancellation flows must NEVER be blocked by a gamified fight.
 */
export function validateBossFightCancellation(intent: 'preview' | 'real_cancel'): BossFightCancellationGuardResponse {
  if (intent === 'preview') {
    return {
      isSafe: true,
      message: 'Preview de gamificação. Não bloqueia cancelamento real e não executa cobrança.',
    };
  }

  return {
    isSafe: false,
    message: 'Aviso: O fluxo de cancelamento real deve ser direto e sem atritos ou barreiras de gamificação.',
  };
}
