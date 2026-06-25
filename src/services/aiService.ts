import { generateGeminiContent } from './geminiProxyClient';

/**
 * AI Service for Plan Insights
 * Provides personalized insights using Gemini.
 */

export interface AIInsightRequest {
  profile: any;
  history: any[];
  currentPlan: any;
}

export const aiService = {
  async getPlanInsights(request: AIInsightRequest) {
    try {
      const response = await generateGeminiContent({
        model: 'gemini-1.5-flash',
        contents: `
          Aja como um personal trainer experiente.
          Analise o perfil do atleta, o histórico de treinos e o plano atual.
          Forneça 3 insights acionáveis para melhorar o desempenho ou a recuperação.

          Perfil: ${JSON.stringify(request.profile)}
          Histórico: ${JSON.stringify(request.history.slice(-5))}
          Plano Atual: ${JSON.stringify(request.currentPlan)}
        `,
      });
      return response.text;
    } catch (error) {
      console.error('Failed to get AI plan insights:', error);
      return 'Nao foi possivel gerar insights de IA no momento.';
    }
  },
};
