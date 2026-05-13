import React, { Suspense } from 'react';
import Dashboard from './pages/Dashboard';
import './index.css';

const ONBOARDING_KEY = '@TreinoApp:onboarding';

if (typeof window !== 'undefined') {
  localStorage.getItem('@TreinoApp:theme');
  localStorage.getItem(ONBOARDING_KEY);
}

export default function App() {
  return (
    <Suspense fallback={<div>Carregando Aplicação...</div>}>
      <Dashboard />
    </Suspense>
  );
}
