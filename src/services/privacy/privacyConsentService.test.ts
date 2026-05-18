import { beforeEach, describe, expect, it } from 'vitest';
import { clearSensitiveLocalData, exportLocalPrivacyData, getPrivacyLocalOnlyNotice, listLocalPrivacyCategories } from './privacyConsentService';

describe('privacyConsentService', () => {
  beforeEach(() => localStorage.clear());

  it('lists known local categories', () => {
    localStorage.setItem('@TreinoApp:bodyMetrics', JSON.stringify([{ weight: 80 }]));
    const categories = listLocalPrivacyCategories();
    expect(categories.some(item => item.key === '@TreinoApp:bodyMetrics')).toBe(true);
  });

  it('exports sanitized local json and keeps out-of-scope untouched', () => {
    localStorage.setItem('@TreinoApp:theme', 'dark');
    localStorage.setItem('third_party_key', 'keep');
    const data = exportLocalPrivacyData();
    expect(data['@TreinoApp:theme']).toBe('dark');
    expect(data.third_party_key).toBeUndefined();
  });

  it('clears sensitive scoped keys only', () => {
    localStorage.setItem('@TreinoApp:bodyMetrics', 'x');
    localStorage.setItem('@TreinoApp:theme', 'dark');
    localStorage.setItem('third_party_key', 'keep');
    const removed = clearSensitiveLocalData();
    expect(removed).toContain('@TreinoApp:bodyMetrics');
    expect(localStorage.getItem('third_party_key')).toBe('keep');
  });

  it('notice is explicit about local-only cleanup', () => {
    expect(getPrivacyLocalOnlyNotice()).toContain('apenas dados locais');
  });
});
