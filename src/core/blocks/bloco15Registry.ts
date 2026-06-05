import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco15Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco15(items: BlockItem[] = bloco15Items) {
  return summarizeBlockItems(items);
}
