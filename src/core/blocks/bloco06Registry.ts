import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco06Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco06(items: BlockItem[] = bloco06Items) {
  return summarizeBlockItems(items);
}
