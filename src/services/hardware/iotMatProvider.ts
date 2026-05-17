/**
 * Item 70: Tapete IoT
 * IoT Provider interface; keep as high-risk/blocked.
 */

export interface IoTMatData {
  pressurePoints: number[];
  balanceCenter: { x: number; y: number };
}

export interface IoTMatProvider {
  connect(): Promise<boolean>;
  getLiveData(): Promise<IoTMatData | null>;
  isSupported(): boolean;
}

export class IoTMatAdapter implements IoTMatProvider {
  isSupported(): boolean {
    // Keep as deferred_high_risk / blocked
    return false;
  }

  async connect(): Promise<boolean> {
    console.warn("IoT Mat integration is currently blocked.");
    return false;
  }

  async getLiveData(): Promise<IoTMatData | null> {
    return null;
  }
}
