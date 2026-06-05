import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco19Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco19(items: BlockItem[] = bloco19Items) {
  return summarizeBlockItems(items);
}
