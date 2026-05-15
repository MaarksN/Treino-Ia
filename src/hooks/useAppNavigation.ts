import { useCallback, useEffect } from 'react';
import { VIEWS, type AppView } from '../navigation/views';
import { useViewStore } from '../stores/viewStore';

export function useAppNavigation(initialView: AppView = VIEWS.LOADING) {
  const view = useViewStore(state => state.view);
  const setView = useViewStore(state => state.setView);
  const initializeView = useViewStore(state => state.initializeView);

  useEffect(() => {
    initializeView(initialView);
  }, [initialView, initializeView]);

  const goToLoading = useCallback(() => setView(VIEWS.LOADING), [setView]);
  const goToRegistration = useCallback(() => setView(VIEWS.REGISTRATION), [setView]);
  const goToHome = useCallback(() => setView(VIEWS.HOME), [setView]);
  const goToDashboard = useCallback(() => setView(VIEWS.DASHBOARD), [setView]);
  const goToSocial = useCallback(() => setView(VIEWS.SOCIAL), [setView]);
  const goToPublicProfile = useCallback(() => setView(VIEWS.PUBLIC_PROFILE), [setView]);

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
