/**
 * Item 58 — Equipment Replan Service
 *
 * Allows manual equipment listing and generates local training adaptations.
 * Photo upload is preview-only; no image recognition engine exists.
 */

export const EQUIPMENT_CATALOG = [
  'halteres',
  'barra',
  'banco',
  'elasticos',
  'maquinas',
  'peso_corporal',
  'kettlebell',
  'anilhas',
  'bola_suica',
  'corda',
] as const;

export type EquipmentId = (typeof EQUIPMENT_CATALOG)[number];

export interface EquipmentAdaptation {
  equipment: EquipmentId[];
  suggestions: string[];
  disclaimer: string;
}

const STORAGE_KEY = '@TreinoIA:ai:selectedEquipment';

const ADAPTATION_MAP: Partial<Record<EquipmentId, string[]>> = {
  peso_corporal: [
    'Flexões, agachamentos, lunges e pranchas como base.',
    'Aumente tempo sob tensão para compensar carga.',
  ],
  halteres: [
    'Supino com halteres, remada unilateral, desenvolvimento.',
    'Variações unilaterais para equilíbrio muscular.',
  ],
  barra: [
    'Agachamento, levantamento terra, supino reto.',
    'Progressão linear de carga semanal.',
  ],
  elasticos: [
    'Puxadas, extensões e rotações com faixas.',
    'Ideal para aquecimento e trabalho de mobilidade.',
  ],
  banco: [
    'Supino inclinado, declinado e reto.',
    'Step-ups e bulgarian split squats.',
  ],
  maquinas: [
    'Leg press, cadeira extensora, puxada.',
    'Máquinas guiadas são ótimas para iniciantes.',
  ],
  kettlebell: [
    'Swing, clean, Turkish get-up.',
    'Exercícios funcionais de corpo inteiro.',
  ],
};

export function sanitizeEquipmentId(value: unknown): EquipmentId | null {
  if (typeof value !== 'string') return null;
  return EQUIPMENT_CATALOG.includes(value as EquipmentId) ? (value as EquipmentId) : null;
}

export function saveSelectedEquipment(ids: EquipmentId[]): EquipmentId[] {
  const sanitized = ids
    .map(id => sanitizeEquipmentId(id))
    .filter((id): id is EquipmentId => id !== null);
  const unique = Array.from(new Set(sanitized));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  return unique;
}

export function getSelectedEquipment(): EquipmentId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return parsed
      .map(item => sanitizeEquipmentId(item))
      .filter((id): id is EquipmentId => id !== null);
  } catch {
    return [];
  }
}

export function generateAdaptation(equipment: EquipmentId[]): EquipmentAdaptation {
  const suggestions: string[] = [];

  if (equipment.length === 0) {
    return {
      equipment: [],
      suggestions: ['Selecione pelo menos um equipamento para receber sugestões de adaptação.'],
      disclaimer: 'Nenhum equipamento selecionado.',
    };
  }

  for (const id of equipment) {
    const tips = ADAPTATION_MAP[id];
    if (tips) suggestions.push(...tips);
  }

  if (suggestions.length === 0) {
    suggestions.push('Equipamentos selecionados, mas sem sugestões específicas ainda.');
  }

  return {
    equipment,
    suggestions,
    disclaimer: 'Sugestões são educacionais e baseadas em equipamentos informados manualmente. Reconhecimento visual por IA não está ativo.',
  };
}

export const EQUIPMENT_PHOTO_GUARD =
  'Upload de foto é apenas para referência visual. Reconhecimento automático de equipamentos por imagem requer engine de visão computacional que não está integrado.';
