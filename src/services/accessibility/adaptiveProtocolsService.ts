/**
 * Item 94 — Adaptive Protocols Service (PCD)
 *
 * Provides exercise protocols for people with disabilities or functional limitations.
 * Does NOT prescribe medical treatment or replace professional guidance.
 * Uses supportive, careful language throughout.
 */

export const ADAPTIVE_PROTOCOL_IDS = [
  'seated',
  'low_impact',
  'reduced_mobility',
  'low_vision',
  'post_injury',
  'upper_limb_amputation',
  'lower_limb_amputation',
] as const;

export type AdaptiveProtocolId = (typeof ADAPTIVE_PROTOCOL_IDS)[number];

export interface AdaptiveProtocol {
  id: AdaptiveProtocolId;
  title: string;
  description: string;
  recommendations: string[];
  contraindications: string[];
  disclaimer: string;
}

const PROTOCOLS: Record<AdaptiveProtocolId, AdaptiveProtocol> = {
  seated: {
    id: 'seated',
    title: 'Treino sentado',
    description: 'Exercícios adaptados para execução em cadeira convencional ou cadeira de rodas.',
    recommendations: [
      'Foco em membros superiores e core.',
      'Faixas elásticas como alternativa a pesos.',
      'Exercícios de respiração para estabilidade postural.',
      'Séries controladas com ênfase em tempo sob tensão.',
    ],
    contraindications: [
      'Evitar movimentos que causem dor ou desconforto.',
      'Não realizar exercícios sem supervisão se houver risco de queda.',
    ],
    disclaimer: 'Adaptações para treino sentado devem ser aprovadas por profissional de saúde antes de iniciar.',
  },
  low_impact: {
    id: 'low_impact',
    title: 'Baixo impacto',
    description: 'Exercícios sem saltos ou impacto articular, adequados para proteção de articulações.',
    recommendations: [
      'Substituir corrida por caminhada ou bicicleta ergométrica.',
      'Agachamento assistido ou na cadeira.',
      'Alongamento dinâmico como aquecimento.',
      'Natação e hidroginástica como complemento.',
    ],
    contraindications: [
      'Evitar exercícios pliométricos.',
      'Não forçar amplitudes de movimento dolorosas.',
    ],
    disclaimer: 'Mesmo exercícios de baixo impacto podem não ser adequados para todas as condições. Consulte seu médico.',
  },
  reduced_mobility: {
    id: 'reduced_mobility',
    title: 'Mobilidade reduzida',
    description: 'Sugestões para pessoas com limitações de amplitude de movimento ou força.',
    recommendations: [
      'Iniciar com amplitude parcial e progredir gradualmente.',
      'Usar máquinas guiadas quando possível.',
      'Exercícios isométricos como alternativa.',
      'Priorizar segurança sobre intensidade.',
    ],
    contraindications: [
      'Não forçar articulações além do limite confortável.',
      'Evitar cargas altas sem supervisão.',
    ],
    disclaimer: 'Limitações de mobilidade variam amplamente. Validação profissional individual é essencial.',
  },
  low_vision: {
    id: 'low_vision',
    title: 'Baixa visão',
    description: 'Recomendações para treinar com segurança quando a visão é limitada.',
    recommendations: [
      'Utilizar o modo alto contraste do app.',
      'Preferir exercícios com padrões de movimento simples.',
      'Usar instruções de áudio quando disponíveis.',
      'Treinar em ambiente conhecido e seguro.',
    ],
    contraindications: [
      'Evitar exercícios que exijam equilíbrio visual preciso sem acompanhamento.',
      'Não usar pesos livres pesados sem supervisão.',
    ],
    disclaimer: 'Treinar com baixa visão requer adaptações individuais. Consulte um educador físico especializado.',
  },
  post_injury: {
    id: 'post_injury',
    title: 'Retorno após lesão',
    description: 'Protocolo gradual para retorno seguro ao treino após lesão ou cirurgia.',
    recommendations: [
      'Iniciar com 40-50% do volume anterior.',
      'Primeiras 2-3 semanas focadas em readaptação.',
      'Monitorar dor, inchaço e limitação de movimento.',
      'Aumentar volume em no máximo 10% por semana.',
    ],
    contraindications: [
      'Não treinar a região lesionada sem liberação médica.',
      'Interromper imediatamente se houver dor aguda.',
    ],
    disclaimer: 'Retorno após lesão deve ser conduzido junto ao médico e/ou fisioterapeuta responsável.',
  },
  upper_limb_amputation: {
    id: 'upper_limb_amputation',
    title: 'Adaptação — membro superior',
    description: 'Sugestões de exercícios adaptados para pessoas com amputação ou ausência de membro superior.',
    recommendations: [
      'Foco em membros inferiores, core e o membro superior disponível.',
      'Exercícios unilaterais com contrapeso quando possível.',
      'Máquinas adaptadas são uma boa opção.',
      'Fortalecimento do core para compensação postural.',
    ],
    contraindications: [
      'Evitar exercícios que dependam de ambas as mãos sem adaptação prévia.',
      'Proteger o coto de pressão excessiva.',
    ],
    disclaimer: 'Adaptações para amputação devem ser planejadas com equipe multidisciplinar: fisioterapeuta, educador físico e médico.',
  },
  lower_limb_amputation: {
    id: 'lower_limb_amputation',
    title: 'Adaptação — membro inferior',
    description: 'Sugestões para pessoas com amputação ou ausência de membro inferior.',
    recommendations: [
      'Foco em membros superiores e core.',
      'Exercícios sentado ou com apoio seguro.',
      'Se usar prótese, exercícios de equilíbrio supervisionados.',
      'Fortalecimento compensatório do membro contralateral.',
    ],
    contraindications: [
      'Não realizar exercícios em pé sem prótese ou apoio seguro.',
      'Evitar impacto no coto.',
    ],
    disclaimer: 'Treinamento com prótese requer validação do protesista e fisioterapeuta. Este conteúdo é sugestivo.',
  },
};

const STORAGE_KEY = '@TreinoIA:accessibility:selectedProtocols';

export function getAllProtocols(): AdaptiveProtocol[] {
  return ADAPTIVE_PROTOCOL_IDS.map(id => PROTOCOLS[id]);
}

export function getProtocolById(id: AdaptiveProtocolId): AdaptiveProtocol | null {
  return PROTOCOLS[id] ?? null;
}

export function sanitizeProtocolId(value: unknown): AdaptiveProtocolId | null {
  if (typeof value !== 'string') return null;
  return ADAPTIVE_PROTOCOL_IDS.includes(value as AdaptiveProtocolId)
    ? (value as AdaptiveProtocolId)
    : null;
}

export function saveSelectedProtocols(ids: AdaptiveProtocolId[]): AdaptiveProtocolId[] {
  const sanitized = ids
    .map(id => sanitizeProtocolId(id))
    .filter((id): id is AdaptiveProtocolId => id !== null);
  const unique = Array.from(new Set(sanitized));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  return unique;
}

export function getSelectedProtocols(): AdaptiveProtocolId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return parsed
      .map(item => sanitizeProtocolId(item))
      .filter((id): id is AdaptiveProtocolId => id !== null);
  } catch {
    return [];
  }
}

export const PCD_DISCLAIMER =
  'Os protocolos adaptativos são sugestões educacionais. Não substituem avaliação e acompanhamento de profissionais de saúde, fisioterapia e educação física. Cada pessoa tem necessidades únicas que devem ser avaliadas individualmente.';
