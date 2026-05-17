export interface UlyssesContract {
  id: string;
  goal: string;
  targetDate: string;
  stakeAmount: number;
  progress: number;
  status: 'active' | 'completed' | 'failed';
}

export interface PlanMarketplaceItem {
  id: string;
  title: string;
  description: string;
  author: string;
  price: number;
  rating: number;
  durationWeeks: number;
}

export interface PayPerWorkoutModel {
  basePrice: number;
  currency: string;
  premiumFeatures: string[];
}

export interface PerformanceDonationConfig {
  enabled: boolean;
  charityName: string;
  amountPerWorkout: number;
  totalDonated: number;
}

export interface SelfBetGuard {
  maxBetAmount: number;
  allowedFrequencies: string[];
  complianceCheckPassed: boolean;
}

export const ulyssesContractPreview: UlyssesContract = {
  id: 'ulysses-1',
  goal: 'Treinar 4x por semana durante 1 mês',
  targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  stakeAmount: 50,
  progress: 0,
  status: 'active',
};

export const marketplaceCatalog: PlanMarketplaceItem[] = [
  {
    id: 'plan-1',
    title: 'Hipertrofia Avançada',
    description: 'Plano focado em ganho de massa muscular para usuários experientes.',
    author: 'Treino IA',
    price: 29.90,
    rating: 4.8,
    durationWeeks: 12,
  },
  {
    id: 'plan-2',
    title: 'Emagrecimento Acelerado',
    description: 'Protocolo de alta intensidade para queima de gordura.',
    author: 'Coach Especialista',
    price: 19.90,
    rating: 4.5,
    durationWeeks: 8,
  }
];

export const payPerWorkoutGuard: PayPerWorkoutModel = {
  basePrice: 4.90,
  currency: 'BRL',
  premiumFeatures: ['Análise de IA avançada', 'Recomendações em tempo real', 'Sem anúncios'],
};

export const donationGuard: PerformanceDonationConfig = {
  enabled: false,
  charityName: 'Selecione uma ONG',
  amountPerWorkout: 0,
  totalDonated: 0,
};

export const selfBetGuard: SelfBetGuard = {
  maxBetAmount: 100, // Limite de segurança local
  allowedFrequencies: ['weekly', 'monthly'],
  complianceCheckPassed: false, // Requer backend real e KYC
};
