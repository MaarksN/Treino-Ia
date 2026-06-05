import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco10Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco10(items: BlockItem[] = bloco10Items) {
  return summarizeBlockItems(items);
}
