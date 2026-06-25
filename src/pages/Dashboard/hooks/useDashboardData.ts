import { useState, useCallback, useEffect } from 'react';
import {
  type UserProfile,
  type WorkoutSession,
  type TrainingPlan,
  type PersistenceStatus,
  createDefaultProfile,
} from '../../../services/database';
import { type AiRecommendationRecord } from '../../../services/data/aiRecommendationRepository';
import { getCurrentAppRoute, subscribeToAppRoute } from '../../../navigation/appRouter';
import { loadDashboardInitialData } from '../services/dashboardDataService';
import { readStarterUser } from '../services/dashboardSession';

export function useDashboardData() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formProfile, setFormProfile] = useState<UserProfile>(() => createDefaultProfile());
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [persistence, setPersistence] = useState<PersistenceStatus | null>(null);
  const [pendingRecommendation, setPendingRecommendation] = useState<AiRecommendationRecord | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(() => getCurrentAppRoute());
  const [showStarterRegistration, setShowStarterRegistration] = useState(false);
  const [showAnamnesis, setShowAnamnesis] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    const data = await loadDashboardInitialData();
    const starterUser = readStarterUser();

    setPersistence(data.persistence);
    setHistory(data.history);
    setProfile(data.profile);
    setPlan(data.plan);
    setPendingRecommendation(data.pendingRecommendation);
    setNotice(data.notice);
    setError(data.error);

    if (!data.profile) {
      setFormProfile({
        ...createDefaultProfile(),
        name: starterUser?.name?.trim() || 'Atleta',
      });
      setShowStarterRegistration(!starterUser);
      setShowAnamnesis(Boolean(starterUser));
    } else {
      setFormProfile(data.profile);
      setShowStarterRegistration(false);
      setShowAnamnesis(false);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => subscribeToAppRoute(setRoute), []);

  return {
    profile, setProfile,
    formProfile, setFormProfile,
    plan, setPlan,
    history, setHistory,
    persistence, setPersistence,
    pendingRecommendation, setPendingRecommendation,
    notice, setNotice,
    error, setError,
    loading,
    route, setRoute,
    showStarterRegistration, setShowStarterRegistration,
    showAnamnesis, setShowAnamnesis,
    loadData
  };
}
