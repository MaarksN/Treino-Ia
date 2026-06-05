import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco13Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco13(items: BlockItem[] = bloco13Items) {
  return summarizeBlockItems(items);
}
