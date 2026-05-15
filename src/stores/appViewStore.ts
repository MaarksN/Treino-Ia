import { create } from 'zustand';

const ONBOARDING_KEY = '@TreinoApp:onboarding';
const initialShowOnboarding = typeof window !== 'undefined' ? !localStorage.getItem(ONBOARDING_KEY) : false;

interface AppViewState {
  darkMode: boolean;
  language: 'PT' | 'EN';
  showOnboarding: boolean;
  setDarkMode: (darkMode: boolean) => void;
  setLanguage: (language: 'PT' | 'EN') => void;
  setShowOnboarding: (showOnboarding: boolean) => void;
}

export const useAppViewStore = create<AppViewState>((set) => ({
  darkMode: true,
  language: 'PT',
  showOnboarding: initialShowOnboarding,
  setDarkMode: (darkMode) => set({ darkMode }),
  setLanguage: (language) => set({ language }),
  setShowOnboarding: (showOnboarding) => set({ showOnboarding }),
}));
