export type AIPersonalityType = 'technical' | 'motivator' | 'friendly';

export interface AIPersonalityOptions {
  type: AIPersonalityType;
  baseMessage: string;
}

export function formatAIPersonality(options: AIPersonalityOptions): string {
  switch (options.type) {
    case 'technical':
      return `[Análise Técnica]: ${options.baseMessage}. Otimize a execução.`;
    case 'motivator':
      return `[BOA!]: ${options.baseMessage}! Vamo pra cima, não desiste! 🔥`;
    case 'friendly':
      return `[Dica Amiga]: ${options.baseMessage}. No seu ritmo, tudo bem? 😊`;
    default:
      return options.baseMessage;
  }
}
