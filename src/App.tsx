import React, { Suspense, useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import { OnboardingTour } from './components/OnboardingTour';
import './index.css';

const ONBOARDING_KEY = '@TreinoApp:onboarding_completed_v2';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('@TreinoApp:theme');
    if (theme) {
      document.documentElement.className = theme;
    }
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCompleteOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  return (
    <Suspense fallback={<div>Carregando Aplicação...</div>}>
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
