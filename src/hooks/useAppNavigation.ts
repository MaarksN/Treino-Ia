import { useCallback, useState } from 'react';
import { VIEWS, type AppView } from '../navigation/views';

export function useAppNavigation(initialView: AppView = VIEWS.LOADING) {
  const [view, setView] = useState<AppView>(initialView);

  const goToLoading = useCallback(() => setView(VIEWS.LOADING), []);
  const goToRegistration = useCallback(() => setView(VIEWS.REGISTRATION), []);
  const goToHome = useCallback(() => setView(VIEWS.HOME), []);
  const goToDashboard = useCallback(() => setView(VIEWS.DASHBOARD), []);
  const goToSocial = useCallback(() => setView(VIEWS.SOCIAL), []);
  const goToPublicProfile = useCallback(() => setView(VIEWS.PUBLIC_PROFILE), []);

  return {
    view,
    setView,
    goToLoading,
    goToRegistration,
    goToHome,
    goToDashboard,
    goToSocial,
    goToPublicProfile,
  };
}
