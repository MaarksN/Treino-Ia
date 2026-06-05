import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco09Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco09(items: BlockItem[] = bloco09Items) {
  return summarizeBlockItems(items);
}
