import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco05Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco05(items: BlockItem[] = bloco05Items) {
  return summarizeBlockItems(items);
}
