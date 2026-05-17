/**
 * Item 68: Oura/Ultrahuman
 * Provider contract for Oura/Ultrahuman. Blocked until real OAuth/API keys exist.
 */

export interface WearableData {
  readinessScore: number;
  sleepScore: number;
  activityScore: number;
}

export interface WearableProvider {
  connect(): Promise<boolean>;
  fetchDailyData(): Promise<WearableData | null>;
  isConfigured(): boolean;
}

// Blocked Provider Implementation
export class OuraUltrahumanProvider implements WearableProvider {
  private configured = false; // Blocked external dependency

  isConfigured(): boolean {
    return this.configured;
  }

  async connect(): Promise<boolean> {
    if (!this.configured) {
      console.warn("Wearable OAuth is not configured yet.");
      return false;
    }
    return true;
  }

  async fetchDailyData(): Promise<WearableData | null> {
    if (!this.configured) {
      return null;
    }
    return null;
  }
}
