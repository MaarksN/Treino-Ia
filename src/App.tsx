import React, { Suspense, useEffect, useState, lazy } from 'react';
import './index.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const OnboardingTour = lazy(() => import('./components/OnboardingTour').then(m => ({ default: m.OnboardingTour })));

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
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando Aplicação...</div>}>
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
