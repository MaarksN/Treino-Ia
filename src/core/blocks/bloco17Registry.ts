import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco17Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco17(items: BlockItem[] = bloco17Items) {
  return summarizeBlockItems(items);
}
