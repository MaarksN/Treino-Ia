import { strategicItemsRegistry } from './strategicItems.registry';
import { type StrategicItemCategory, type StrategicItemStatus } from './strategicItems.types';

export const getAllStrategicItems = () => strategicItemsRegistry;

export const getStrategicItemsByStatus = (status: StrategicItemStatus) =>
  strategicItemsRegistry.filter(item => item.status === status);

export const getStrategicItemsByCategory = (category: StrategicItemCategory) =>
  strategicItemsRegistry.filter(item => item.category === category);
