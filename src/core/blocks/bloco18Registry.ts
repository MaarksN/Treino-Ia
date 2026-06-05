import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco18Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco18(items: BlockItem[] = bloco18Items) {
  return summarizeBlockItems(items);
}
