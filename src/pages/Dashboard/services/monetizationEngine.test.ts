import { describe, it, expect } from 'vitest';
import {
  ulyssesContractPreview,
  marketplaceCatalog,
  donationGuard,
  selfBetGuard,
  payPerWorkoutGuard
} from './monetizationEngine';

describe('Monetization Engine', () => {
  it('should provide a mock Ulysses Contract for preview', () => {
    expect(ulyssesContractPreview).toBeDefined();
    expect(ulyssesContractPreview.status).toBe('active');
    expect(ulyssesContractPreview.stakeAmount).toBeGreaterThan(0);
  });

  it('should provide a mock marketplace catalog', () => {
    expect(marketplaceCatalog.length).toBeGreaterThan(0);
    expect(marketplaceCatalog[0].price).toBeGreaterThan(0);
  });

  it('should block donations without a real provider', () => {
    expect(donationGuard.enabled).toBe(false);
  });

  it('should block self-bets without compliance KYC', () => {
    expect(selfBetGuard.complianceCheckPassed).toBe(false);
    expect(selfBetGuard.maxBetAmount).toBe(100);
  });

  it('should have a pay-per-workout configuration', () => {
    expect(payPerWorkoutGuard.basePrice).toBeGreaterThan(0);
  });
});
