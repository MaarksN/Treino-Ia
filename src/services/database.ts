// Arquivo gerado automaticamente - Camada de Banco de Dados
export interface UserProfile {
  id: string;
  name: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  goal: string;
}

export const DatabaseService = {
  saveProfile: async (profile: UserProfile): Promise<boolean> => {
    try {
      // Aqui simulamos uma chamada assíncrona que depois pode ser trocada para o Firebase/Supabase
      localStorage.setItem('@TreinoIA:profile', JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Erro ao salvar no banco:', error);
      return false;
    }
  },
  getProfile: async (): Promise<UserProfile | null> => {
    try {
      const data = localStorage.getItem('@TreinoIA:profile');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }
};
