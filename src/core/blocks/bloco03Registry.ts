import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco03Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco03(items: BlockItem[] = bloco03Items) {
  return summarizeBlockItems(items);
}
