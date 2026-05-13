export type BlockStatus = 'pending' | 'implemented' | 'partial' | 'blocked' | 'mock_dev_only';
export interface BlockItem { id: number; name: string; status: BlockStatus; }
export const bloco17Items: BlockItem[] = [
  { id: 1, name: "Item 01", status: 'pending' as const },
  { id: 2, name: "Item 02", status: 'pending' as const },
  { id: 3, name: "Item 03", status: 'pending' as const },
  { id: 4, name: "Item 04", status: 'pending' as const },
  { id: 5, name: "Item 05", status: 'pending' as const },
  { id: 6, name: "Item 06", status: 'pending' as const },
  { id: 7, name: "Item 07", status: 'pending' as const },
  { id: 8, name: "Item 08", status: 'pending' as const },
  { id: 9, name: "Item 09", status: 'pending' as const },
  { id: 10, name: "Item 10", status: 'pending' as const },
  { id: 11, name: "Item 11", status: 'pending' as const },
  { id: 12, name: "Item 12", status: 'pending' as const },
  { id: 13, name: "Item 13", status: 'pending' as const },
  { id: 14, name: "Item 14", status: 'pending' as const },
  { id: 15, name: "Item 15", status: 'pending' as const },
  { id: 16, name: "Item 16", status: 'pending' as const },
  { id: 17, name: "Item 17", status: 'pending' as const },
  { id: 18, name: "Item 18", status: 'pending' as const },
  { id: 19, name: "Item 19", status: 'pending' as const },
  { id: 20, name: "Item 20", status: 'pending' as const },
];
export function summarizeBloco17(items: BlockItem[] = bloco17Items) {
  const implemented = items.filter((item) => item.status === 'implemented').length;
  const blocked = items.filter((item) => item.status === 'blocked').length;
  const mockDevOnly = items.filter((item) => item.status === 'mock_dev_only').length;
  return { total: items.length, implemented, blocked, mockDevOnly, readyForPr: blocked === 0, readyForProduction: implemented === items.length && blocked === 0 && mockDevOnly === 0 };
}
export function assertAuthenticatedUser(userId?: string) { if (!userId || userId.length < 8) throw new Error('Usuário autenticado é obrigatório.'); return userId; }
export function assertServerSourceOfTruth(source: 'server' | 'client' | 'localStorage' | 'mock') { if (source !== 'server') throw new Error('Fonte server-side obrigatória.'); }
