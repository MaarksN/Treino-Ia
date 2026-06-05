import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco08Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco08(items: BlockItem[] = bloco08Items) {
  return summarizeBlockItems(items);
}
