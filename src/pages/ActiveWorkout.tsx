import React, { useState } from 'react';
import { Exercise, WorkoutDatabase } from '../services/workoutDatabase';
import { toggleExerciseCompletion, calculateWorkoutProgress } from '../rules/workoutEngine';

// Mock inicial gerado pela IA (Bloco 01)
const INITIAL_ROUTINE: Exercise[] = [
  { id: '1', name: 'Supino Reto com Barra', sets: 3, reps: '8-10', weight: 20, completed: false },
  { id: '2', name: 'Puxada Frontal Aberta', sets: 3, reps: '10-12', weight: 45, completed: false },
  { id: '3', name: 'Agachamento Livre', sets: 4, reps: '8-10', weight: 30, completed: false },
];

export default function ActiveWorkout() {
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_ROUTINE);
  const [isFinished, setIsFinished] = useState(false);

  const progress = calculateWorkoutProgress(exercises);

  const handleToggle = (id: string) => {
    setExercises(toggleExerciseCompletion(exercises, id));
  };

  const handleFinish = async () => {
    await WorkoutDatabase.saveSession({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exercises
    });
    setIsFinished(true);
  };

  if (isFinished) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h2 style={{ color: '#27ae60', fontSize: '28px' }}>Treino Concluído! 🎉</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>Excelente trabalho. Sua sessão foi registrada no histórico.</p>
        <button 
          onClick={() => { setIsFinished(false); setExercises(INITIAL_ROUTINE); }} 
          style={{ padding: '12px 24px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Fazer Novo Treino
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{ marginBottom: '25px' }}>
        <h1 style={{ color: '#2c3e50', margin: '0 0 15px 0' }}>Execução de Treino</h1>
        
        {/* Barra de Progresso */}
        <div style={{ background: '#ecf0f1', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, background: progress === 100 ? '#27ae60' : '#3498db', height: '100%', transition: 'width 0.4s ease-out, background 0.4s' }} />
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#7f8c8d', fontWeight: 'bold' }}>Progresso: {progress}%</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {exercises.map(ex => (
          <div 
            key={ex.id} 
            onClick={() => handleToggle(ex.id)}
            style={{ 
              display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '10px', 
              background: ex.completed ? '#e8f8f5' : '#ffffff', 
              border: `2px solid ${ex.completed ? '#2ecc71' : '#e1e1e1'}`,
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
            
            <input 
              type="checkbox" 
              checked={ex.completed} 
              onChange={() => handleToggle(ex.id)} 
              style={{ width: '22px', height: '22px', marginRight: '15px', pointerEvents: 'none' }} 
            />
            
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', color: ex.completed ? '#27ae60' : '#2c3e50', fontSize: '16px', textDecoration: ex.completed ? 'line-through' : 'none' }}>
                {ex.name}
              </h3>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '13px' }}>
                {ex.sets} séries x {ex.reps} reps | <strong>{ex.weight}kg</strong> (cada lado)
              </p>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleFinish} 
        disabled={progress !== 100} 
        style={{ 
          width: '100%', marginTop: '30px', padding: '16px', 
          background: progress === 100 ? '#27ae60' : '#bdc3c7', 
          color: 'white', border: 'none', borderRadius: '10px', 
          fontSize: '16px', fontWeight: 'bold', 
          cursor: progress === 100 ? 'pointer' : 'not-allowed',
          transition: 'background 0.3s'
        }}>
        {progress === 100 ? 'Finalizar Treino' : 'Complete os exercícios para finalizar'}
      </button>
    </div>
  );
}
