import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco01Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco01(items: BlockItem[] = bloco01Items) {
  return summarizeBlockItems(items);
}
