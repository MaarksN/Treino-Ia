export type BlockStatus = 'pending' | 'implemented' | 'partial' | 'blocked' | 'mock_dev_only';

export interface BlockItem {
  id: number;
  name: string;
  status: BlockStatus;
}

export interface BlockSummary {
  total: number;
  implemented: number;
  blocked: number;
  mockDevOnly: number;
  readyForPr: boolean;
  readyForProduction: boolean;
}

export function createPendingBlockItems(total = 20): BlockItem[] {
  return Array.from({ length: total }, (_, index) => {
    const id = index + 1;

    return {
      id,
      name: `Item ${String(id).padStart(2, '0')}`,
      status: 'pending',
    };
  });
}

export function summarizeBlockItems(items: BlockItem[]): BlockSummary {
  const implemented = items.filter((item) => item.status === 'implemented').length;
  const blocked = items.filter((item) => item.status === 'blocked').length;
  const mockDevOnly = items.filter((item) => item.status === 'mock_dev_only').length;

  return {
    total: items.length,
    implemented,
    blocked,
    mockDevOnly,
    readyForPr: blocked === 0,
    readyForProduction: implemented === items.length && blocked === 0 && mockDevOnly === 0,
  };
}

export function assertAuthenticatedUser(userId?: string) {
  if (!userId || userId.length < 8) throw new Error('Usuário autenticado é obrigatório.');
  return userId;
}

export function assertServerSourceOfTruth(source: 'server' | 'client' | 'localStorage' | 'mock') {
  if (source !== 'server') throw new Error('Fonte server-side obrigatória.');
}
