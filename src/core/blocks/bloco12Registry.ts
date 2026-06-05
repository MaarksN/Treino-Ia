import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco12Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco12(items: BlockItem[] = bloco12Items) {
  return summarizeBlockItems(items);
}
