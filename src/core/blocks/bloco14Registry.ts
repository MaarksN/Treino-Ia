import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco14Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco14(items: BlockItem[] = bloco14Items) {
  return summarizeBlockItems(items);
}
