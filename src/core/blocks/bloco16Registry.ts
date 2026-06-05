import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco16Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco16(items: BlockItem[] = bloco16Items) {
  return summarizeBlockItems(items);
}
