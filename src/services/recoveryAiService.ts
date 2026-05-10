import { RecoveryScoreResult, WellnessEntry } from '../types/recovery';
import { calculateRecoveryScore } from '../utils/recoveryScore';

export function getRecoveryRecommendation(entry: WellnessEntry): RecoveryScoreResult {
  return calculateRecoveryScore(entry);
}

export function buildMobilityProtocol(focus: string) {
  return [
    `Respiracao 90/90 por 2 min para baixar ativacao.`,
    `Mobilidade especifica para ${focus || 'quadril e torax'} por 6 min.`,
    'Alongamento leve dos grupos treinados por 30-45s.',
    'Caminhada leve de 5 min se o treino foi muito intenso.',
  ];
}
