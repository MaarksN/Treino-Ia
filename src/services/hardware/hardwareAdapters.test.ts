import { describe, it, expect } from 'vitest';
import { OuraUltrahumanProvider } from './ouraUltrahumanProvider';
import { IoTMatAdapter } from './iotMatProvider';

describe('Hardware Providers (Lote 14)', () => {
  describe('Wearables Provider (Oura/Ultrahuman)', () => {
    it('is blocked and not configured', async () => {
      const provider = new OuraUltrahumanProvider();
      expect(provider.isConfigured()).toBe(false);
      expect(await provider.connect()).toBe(false);
      expect(await provider.fetchDailyData()).toBeNull();
    });
  });

  describe('IoT Mat Provider', () => {
    it('is unsupported and blocked', async () => {
      const provider = new IoTMatAdapter();
      expect(provider.isSupported()).toBe(false);
      expect(await provider.connect()).toBe(false);
      expect(await provider.getLiveData()).toBeNull();
    });
  });
});
