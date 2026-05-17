export interface MobilityLog {
  id: string;
  date: string;
  joint: string;
  score: number;
  notes: string;
}

export const DEFAULT_MOBILITY_JOINT = 'Ombro';
export const DEFAULT_MOBILITY_SCORE = 5;
export const MOBILITY_CAMERA_GUARD_MESSAGE =
  'Erro de permissão: Acesso à câmera para avaliação articular está bloqueado ou em fundação devido a riscos de privacidade/integração (Item 88 Guard). Faça o registro manual.';

export function createMobilityLog(
  input: Pick<MobilityLog, 'joint' | 'score' | 'notes'>,
  loggedAt = new Date(),
): MobilityLog {
  return {
    id: loggedAt.getTime().toString(),
    date: loggedAt.toISOString(),
    joint: input.joint,
    score: input.score,
    notes: input.notes,
  };
}
