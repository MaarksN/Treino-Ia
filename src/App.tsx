import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import {
  getCurrentAppRoute,
  replaceUnknownAppRoute,
  subscribeToAppRoute,
} from './navigation/appRouter';
import { applyTheme, loadThemeId } from './utils/themeUtils';

import './index.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const OnboardingTour = lazy(() =>
  import('./components/OnboardingTour').then(module => ({ default: module.OnboardingTour })),
);

const ONBOARDING_KEY = '@TreinoApp:onboarding';

const LIGHT_THEME_VARS: Record<string, string> = {
  '--color-brand-neon': '#a3e635',
  '--color-brand-neon-hover': '#84cc16',
  '--color-brand-magenta': '#f43f5e',
  '--color-brand-dark': '#0a0a0a',
  '--color-brand-gray': '#141413',
  '--color-brand-surface': '#1a1917',
  '--color-brand-light': '#f8fafc',
  '--color-brand-muted': '#6b7280',
  '--gradient-hero': 'linear-gradient(135deg, #0a0a0a 0%, #1a1917 100%)',
};

function readOnboardingCompleted(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(ONBOARDING_KEY) === 'true' || localStorage.getItem(ONBOARDING_KEY) === '1';
}

function applyStoredTheme(): void {
  const savedTheme = localStorage.getItem('@TreinoApp:theme');
  document.documentElement.setAttribute('data-theme', savedTheme === 'light' ? 'light' : 'dark');

  if (savedTheme === 'light') {
    Object.entries(LIGHT_THEME_VARS).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    return;
  }

  applyTheme(loadThemeId());
}

function LoadingShell() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-4">
      <div className="relative mb-8 h-32 w-32">
        <div className="absolute inset-0 rounded-full border-4 border-brand-neon opacity-20 animate-ping" />
        <div className="absolute inset-3 rounded-full border-4 border-brand-magenta border-t-transparent animate-spin" />
        <Dumbbell className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-brand-light animate-pulse" />
      </div>
      <h2 className="font-display text-5xl uppercase tracking-widest text-brand-light text-shadow-neon">
        Inicializando
      </h2>
      <p className="mt-3 font-mono text-sm uppercase tracking-widest text-brand-magenta">
        Carregando dados da forja...
      </p>
    </div>
  );
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(() => !readOnboardingCompleted());
  const [route, setRoute] = useState(() => getCurrentAppRoute());

  useEffect(() => {
    applyStoredTheme();
  }, []);

  useEffect(() => subscribeToAppRoute(setRoute), []);

  useEffect(() => {
    if (!route.isKnownPath && replaceUnknownAppRoute()) {
      setRoute(getCurrentAppRoute());
    }
  }, [route]);

  const handleCompleteOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  }, []);

  return (
    <Suspense fallback={<LoadingShell />}>
      {showOnboarding && (
        <OnboardingTour
          onComplete={handleCompleteOnboarding}
          onSkip={handleCompleteOnboarding}
        />
      )}
      <Dashboard />
    </Suspense>
  );
}
