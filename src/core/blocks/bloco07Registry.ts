import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco07Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco07(items: BlockItem[] = bloco07Items) {
  return summarizeBlockItems(items);
}
