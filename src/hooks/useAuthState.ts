import { useEffect } from 'react';
import { onAuthStateChange } from '../services/authService';

interface UseAuthStateParams {
  onSessionRefresh: () => void | Promise<void>;
}

export function useAuthState({ onSessionRefresh }: UseAuthStateParams) {
  useEffect(() => {
    return onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        void onSessionRefresh();
      }
    });
  }, [onSessionRefresh]);
}
