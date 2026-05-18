import { describe, expect, it } from 'vitest';
import { classifyDataSensitivity, decideLocalStoragePolicy } from './sensitiveStoragePolicy';

describe('sensitiveStoragePolicy', () => {
  it('classifies base64 image as sensitive_image', () => {
    expect(classifyDataSensitivity('photoBase64', 'data:image/png;base64,abc')).toBe('sensitive_image');
  });
  it('classifies token as credential', () => {
    expect(classifyDataSensitivity('access_token', 'x')).toBe('credential');
  });
  it('classifies body composition as sensitive_health', () => {
    expect(classifyDataSensitivity('@TreinoApp:bodyMetrics', [{ weight: 80 }])).toBe('sensitive_health');
  });
  it('policy denies sensitive image local persistence', () => {
    expect(decideLocalStoragePolicy('sensitive_image').decision).toBe('deny_backend_required');
  });
  it('allows low sensitivity data', () => {
    expect(decideLocalStoragePolicy('low').decision).toBe('allow');
  });
  it('requires ttl/consent for health data', () => {
    const result = decideLocalStoragePolicy('sensitive_health');
    expect(result.decision).toBe('allow_with_ttl');
    expect(result.message).toContain('consentimento');
  });
});
