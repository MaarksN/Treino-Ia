import { createPendingBlockItems, summarizeBlockItems } from './blockRegistryFactory';
import type { BlockItem } from './blockRegistryFactory';

export { assertAuthenticatedUser, assertServerSourceOfTruth } from './blockRegistryFactory';
export type { BlockItem, BlockStatus } from './blockRegistryFactory';

export const bloco11Items: BlockItem[] = createPendingBlockItems();

export function summarizeBloco11(items: BlockItem[] = bloco11Items) {
  return summarizeBlockItems(items);
}
