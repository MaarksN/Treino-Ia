import React, { Suspense } from 'react';
import Dashboard from './pages/Dashboard';
import './index.css';

export default function App() {
  return (
    <Suspense fallback={<div>Carregando Aplicação...</div>}>
      <Dashboard />
    </Suspense>
  );
}
