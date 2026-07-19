import {
  DatabaseService,
  createDefaultProfile,
  type UserProfile,
  type WorkoutSession,
  type PersistenceStatus,
  TrainingPlan,
} from '../../../services/database';
import { CurrentPlanConsistencyHelper } from '../../../services/data/currentPlanConsistency';
import {
  aiRecommendationRepository,
  type AiRecommendationRecord,
} from '../../../services/data/aiRecommendationRepository';
import { calculateTrainingPlan } from '../../../rules/iaEngine';
import { readStarterUser } from './dashboardSession';
import { trackDay7Return } from '../../../utils/analytics';
import { captureError } from '../../../utils/errorTelemetry';
import { type User as StarterUser } from '../../../types';

export interface DashboardData {
  profile: UserProfile | null;
  plan: TrainingPlan | null;
  history: WorkoutSession[];
  persistence: PersistenceStatus | null;
  pendingRecommendation: AiRecommendationRecord | null;
  notice: string;
  error: string;
}

export async function loadDashboardInitialData(): Promise<DashboardData> {
  const data: DashboardData = {
    profile: null,
    plan: null,
    history: [],
    persistence: null,
    pendingRecommendation: null,
    notice: '',
    error: '',
  };

  try {
    const status = await DatabaseService.getPersistenceStatus();
    const storedProfile = await DatabaseService.getProfile();
    const storedHistory = await DatabaseService.getWorkoutHistory();
    const starterUser = readStarterUser() as (StarterUser & { createdAt?: number }) | null;

    data.persistence = status;
    data.history = storedHistory;

    trackDay7Return(starterUser?.createdAt, {
      hasProfile: Boolean(storedProfile),
      historyCount: storedHistory.length,
    });

    if (!storedProfile) {
      return data;
    }

    const storedPlan = await DatabaseService.getCurrentPlan();
    const currentPlan = storedPlan?.days?.length
      ? storedPlan
      : calculateTrainingPlan(storedProfile, storedHistory);

    if (!storedPlan?.days?.length) {
      const res = await CurrentPlanConsistencyHelper.setCurrentPlan(currentPlan);
      if (res.status === 'local_fallback') {
        data.notice = 'Plano salvo localmente. Aguardando sincronização.';
      }
    }

    data.profile = storedProfile;
    data.plan = currentPlan;
    data.pendingRecommendation =
      await aiRecommendationRepository.getLatestPendingPlanRecommendation();
  } catch (err) {
    captureError(err, 'dashboardDataService.loadDashboardInitialData');
    data.error = 'Não consegui carregar os dados. Verifique a configuração local ou Supabase.';
  }

  return data;
}

export async function handleSignOutAndReload() {
  await DatabaseService.signOut();
  return loadDashboardInitialData();
}
