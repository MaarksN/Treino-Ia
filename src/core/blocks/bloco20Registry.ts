import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco20Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco20(items: BlockItem[] = bloco20Items) {
  return summarizeBlockItems(items);
}
