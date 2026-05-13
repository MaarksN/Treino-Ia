import React, { useState, useEffect } from 'react';
import { DatabaseService, UserProfile } from '../services/database';
import { calculateTrainingPlan, TrainingPlan } from '../rules/iaEngine';

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    let data = await DatabaseService.getProfile();
    if (!data) {
      // Se não tem dados, cria um perfil de exemplo inicial
      data = { id: '1', name: 'Atleta', level: 'intermediario', goal: 'Hipertrofia' };
      await DatabaseService.saveProfile(data);
    }
    setProfile(data);
    setPlan(calculateTrainingPlan(data.level, data.goal));
  };

  if (!profile || !plan) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando Inteligência Artificial...</div>;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Treino IA - Painel Inteligente</h1>
        <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>Bem-vindo de volta, <strong>{profile.name}</strong></p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Card do Perfil */}
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e1e1e1' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0, color: '#2980b9' }}>Seu Perfil Atual</h2>
          <p><strong>Nível:</strong> <span style={{ textTransform: 'capitalize' }}>{profile.level}</span></p>
          <p><strong>Objetivo:</strong> {profile.goal}</p>
        </div>

        {/* Card do Plano Gerado pela IA */}
        <div style={{ background: '#e8f4f8', padding: '20px', borderRadius: '12px', border: '1px solid #bce0fd' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0, color: '#0984e3' }}>Estratégia de Treino (IA)</h2>
          <p><strong>Volume:</strong> {plan.volume}</p>
          <p><strong>Frequência:</strong> {plan.frequency}</p>
          <p><strong>Foco:</strong> {plan.focus}</p>
        </div>
      </div>

      <div style={{ background: '#2c3e50', color: 'white', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
        <h2 style={{ fontSize: '18px', marginTop: 0, color: '#f1c40f' }}>💡 Conselho da Inteligência Artificial</h2>
        <p style={{ margin: 0, lineHeight: '1.5' }}>{plan.aiRecommendation}</p>
      </div>
    </div>
  );
}
