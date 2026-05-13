// Arquivo gerado automaticamente - Regras de Execução de Treino
import { Exercise } from '../services/workoutDatabase';

// Regra: Alterna o status de concluído de um exercício específico
export function toggleExerciseCompletion(exercises: Exercise[], exerciseId: string): Exercise[] {
  return exercises.map(ex =>
    ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
  );
}

// Regra: Calcula a porcentagem total de conclusão do treino
export function calculateWorkoutProgress(exercises: Exercise[]): number {
  if (exercises.length === 0) return 0;
  const completedCount = exercises.filter(ex => ex.completed).length;
  return Math.round((completedCount / exercises.length) * 100);
}
