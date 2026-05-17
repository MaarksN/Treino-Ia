export interface SmartPantryState {
  isIoTConnected: boolean;
  canUseLocalModel: boolean;
  status: 'local_manual_only' | 'iot_connected' | 'foundation_created';
}

/**
 * Item 59 - Despensa inteligente
 * Creates local model for ingredients/manual. No fake external IoT.
 */
export function checkSmartPantryGuard(): SmartPantryState {
  return {
    isIoTConnected: false,
    canUseLocalModel: true,
    status: 'foundation_created'
  };
}

export function addIngredientLocally(ingredient: string): string[] {
  // Manual local tracking only
  return [ingredient];
}
