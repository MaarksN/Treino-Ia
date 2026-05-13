import React, { useState, Suspense } from 'react';
import Dashboard from './pages/Dashboard';
import ActiveWorkout from './pages/ActiveWorkout';
import './index.css';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<'dashboard' | 'workout'>('dashboard');

  return (
    <div style={{ paddingBottom: '80px' }}> {/* Espaço para o menu inferior não cobrir o conteúdo */}
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>}>
        {currentRoute === 'dashboard' ? <Dashboard /> : <ActiveWorkout />}
      </Suspense>

      {/* Navegação Inferior (Estilo App Mobile) */}
      <nav style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: 'white', borderTop: '1px solid #e1e1e1', 
        display: 'flex', padding: '10px 15px', justifyContent: 'space-around', 
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)', zIndex: 1000 
      }}>
        <button 
          onClick={() => setCurrentRoute('dashboard')}
          style={{ 
            flex: 1, padding: '12px', background: currentRoute === 'dashboard' ? '#e8f4f8' : 'transparent', 
            color: currentRoute === 'dashboard' ? '#2980b9' : '#95a5a6', border: 'none', 
            borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
          }}>
          <span style={{ fontSize: '20px' }}>📊</span>
          <span style={{ fontSize: '12px' }}>Painel</span>
        </button>
        <button 
          onClick={() => setCurrentRoute('workout')}
          style={{ 
            flex: 1, padding: '12px', background: currentRoute === 'workout' ? '#e8f8f5' : 'transparent', 
            color: currentRoute === 'workout' ? '#27ae60' : '#95a5a6', border: 'none', 
            borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
          }}>
          <span style={{ fontSize: '20px' }}>💪</span>
          <span style={{ fontSize: '12px' }}>Treinar</span>
        </button>
      </nav>
    </div>
  );
}
