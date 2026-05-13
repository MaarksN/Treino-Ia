// Arquivo gerado automaticamente - Camada de Banco de Dados (Treinos)
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: number;
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: Exercise[];
}

export const WorkoutDatabase = {
  saveSession: async (session: WorkoutSession): Promise<boolean> => {
    try {
      const history = await WorkoutDatabase.getHistory();
      history.push(session);
      localStorage.setItem('@TreinoIA:history', JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      return false;
    }
  },
  getHistory: async (): Promise<WorkoutSession[]> => {
    try {
      const data = localStorage.getItem('@TreinoIA:history');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }
};
