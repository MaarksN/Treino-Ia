/**
 * Item 91 — Adaptive Pathways Service
 *
 * Offers curated training pathways for users with different needs.
 * Does NOT prescribe medical treatment.
 * Recommends professional guidance when appropriate.
 */

export const ADAPTIVE_PATHWAY_IDS = [
  'absolute_beginner',
  'reduced_mobility',
  'low_vision',
  'return_after_break',
  'seated_training',
  'low_impact',
] as const;

export type AdaptivePathwayId = (typeof ADAPTIVE_PATHWAY_IDS)[number];

export interface AdaptivePathway {
  id: AdaptivePathwayId;
  title: string;
  description: string;
  tips: string[];
  disclaimer: string;
}

const PATHWAYS: Record<AdaptivePathwayId, AdaptivePathway> = {
  absolute_beginner: {
    id: 'absolute_beginner',
    title: 'Iniciante absoluto',
    description:
      'Trilha para quem nunca treinou ou está começando do zero. Foco em aprender movimentos básicos com segurança.',
    tips: [
      'Comece com exercícios de peso corporal.',
      'Sessões curtas de 15 a 25 minutos.',
      'Priorize a técnica sobre a carga.',
      'Descanse pelo menos 1 dia entre sessões.',
    ],
    disclaimer:
      'Este conteúdo é educacional. Consulte um profissional de educação física antes de iniciar qualquer programa de treino.',
  },
  reduced_mobility: {
    id: 'reduced_mobility',
    title: 'Mobilidade reduzida',
    description:
      'Sugestões adaptadas para pessoas com restrições de mobilidade. Exercícios podem ser ajustados para cadeira ou apoios.',
    tips: [
      'Exercícios podem ser feitos sentado ou com apoio.',
      'Use faixas elásticas como alternativa a pesos livres.',
      'Respeite amplitudes de movimento confortáveis.',
      'Progressão por repetições antes de aumentar carga.',
    ],
    disclaimer:
      'Esta trilha não substitui acompanhamento de fisioterapeuta ou médico. Adaptações devem ser validadas por profissional qualificado.',
  },
  low_vision: {
    id: 'low_vision',
    title: 'Baixa visão',
    description:
      'Recomendações para quem precisa de interface adaptada e instruções claras em áudio ou texto grande.',
    tips: [
      'Ative o modo alto contraste do app.',
      'Use o modo de linguagem simples para instruções.',
      'Prefira exercícios com padrões de movimento simples.',
      'Considere treinar com acompanhamento presencial.',
    ],
    disclaimer:
      'O app oferece ferramentas de acessibilidade visual, mas não substitui avaliação oftalmológica ou acompanhamento profissional.',
  },
  return_after_break: {
    id: 'return_after_break',
    title: 'Retorno após pausa',
    description:
      'Trilha para quem ficou semanas ou meses sem treinar. Foco em retomar gradualmente.',
    tips: [
      'Reduza o volume para 50-60% do que fazia antes.',
      'Primeiras 2 semanas: foco em adaptação muscular.',
      'Monitore a dor muscular tardia (DOMS).',
      'Aumente volume em 10% por semana se não houver dor excessiva.',
    ],
    disclaimer:
      'Este guia é educacional. Respeite seus limites e consulte um profissional se sentir dor persistente.',
  },
  seated_training: {
    id: 'seated_training',
    title: 'Treino sentado',
    description:
      'Exercícios adaptados para serem realizados sentado em cadeira ou cadeira de rodas.',
    tips: [
      'Foque em membros superiores e core.',
      'Faixas elásticas são ótimas aliadas.',
      'Exercícios de respiração melhoram estabilidade.',
      'Progressão por tempo sob tensão e repetições.',
    ],
    disclaimer:
      'Adaptações para treino sentado devem ser validadas por profissional de saúde. Este conteúdo é sugestivo, não prescritivo.',
  },
  low_impact: {
    id: 'low_impact',
    title: 'Treino de baixo impacto',
    description:
      'Exercícios sem saltos ou impacto articular. Ideal para proteger joelhos, tornozelos e quadril.',
    tips: [
      'Substitua corrida por caminhada ou bicicleta.',
      'Prefira agachamento na cadeira a saltos.',
      'Alongamento dinâmico como aquecimento.',
      'Natação e pilates são excelentes complementos.',
    ],
    disclaimer:
      'Treino de baixo impacto reduz estresse articular, mas não elimina riscos. Consulte um profissional se tiver lesões.',
  },
};

const STORAGE_KEY = '@TreinoIA:accessibility:selectedPathways';

export function getAllPathways(): AdaptivePathway[] {
  return ADAPTIVE_PATHWAY_IDS.map(id => PATHWAYS[id]);
}

export function getPathwayById(id: AdaptivePathwayId): AdaptivePathway | null {
  return PATHWAYS[id] ?? null;
}

export function sanitizePathwayId(value: unknown): AdaptivePathwayId | null {
  if (typeof value !== 'string') return null;
  return ADAPTIVE_PATHWAY_IDS.includes(value as AdaptivePathwayId)
    ? (value as AdaptivePathwayId)
    : null;
}

export function saveSelectedPathways(ids: AdaptivePathwayId[]): AdaptivePathwayId[] {
  const sanitized = ids
    .map(id => sanitizePathwayId(id))
    .filter((id): id is AdaptivePathwayId => id !== null);
  const unique = Array.from(new Set(sanitized));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  return unique;
}

export function getSelectedPathways(): AdaptivePathwayId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return parsed
      .map(item => sanitizePathwayId(item))
      .filter((id): id is AdaptivePathwayId => id !== null);
  } catch {
    return [];
  }
}
