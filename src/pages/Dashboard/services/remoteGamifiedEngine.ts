import { type UserProfile, type WorkoutSession } from '../../../services/database';

export interface CoopGuardState {
  isAvailable: boolean;
  statusLabel: string;
  explanation: string;
}

export interface DeathPenaltyState {
  isActive: boolean;
  warningLabel: string;
  consequence: string;
}

export interface RoguelikeState {
  isUnlocked: boolean;
  currentRunActive: boolean;
  lives: number;
}

export interface CosmeticDropState {
  availableDrops: number;
  unlockedItems: string[];
}

export interface MusclePetState {
  petName: string;
  health: number;
  happiness: number;
  status: string;
}

export interface RemoteGamifiedState {
  coopGuard: CoopGuardState;
  deathPenalty: DeathPenaltyState;
  roguelike: RoguelikeState;
  cosmeticDrops: CosmeticDropState;
  musclePet: MusclePetState;
}

export function buildRemoteGamifiedState(
  profile: UserProfile,
  history: WorkoutSession[],
): RemoteGamifiedState {
  return {
    coopGuard: {
      isAvailable: false,
      statusLabel: 'Co-op remoto em breve',
      explanation: 'Esta funcionalidade requer conexão externa (WebSocket) para multiplayer real. A interface local está pronta para integração futura.',
    },
    deathPenalty: {
      isActive: false, // Opcional, o usuário teria que ligar. Pode ser simulado como desligado sempre ou ligado se historico tiver algo.
      warningLabel: 'Modo Extremo (Visual)',
      consequence: 'Se ativado, falhas consecutivas afetam a arte do Dashboard, sem apagar seu histórico ou prejudicar métricas reais.',
    },
    roguelike: {
      isUnlocked: history.length >= 5,
      currentRunActive: false,
      lives: 3,
    },
    cosmeticDrops: {
      availableDrops: Math.floor(history.length / 5), // Exemplo: 1 drop a cada 5 treinos
      unlockedItems: history.length >= 10 ? ['Tema Dark-Neon', 'Ícone Caveira'] : [],
    },
    musclePet: {
      petName: 'Biceps Buddy',
      health: history.length > 0 ? 100 : 50,
      happiness: Math.min(100, 50 + (history.length * 5)),
      status: history.length > 0 ? 'Forte e saudável' : 'Precisando de treino',
    }
  };
}
