import { describe, it, expect } from 'vitest';
import { Organization } from './Organization';

describe('Organization Entity', () => {
  it('should create a valid Organization', () => {
    const org = Organization.create({
      name: 'Acme Corp',
      cnpj: '12.345.678/0001-95',
      website: 'https://acme.com',
      industry: 'Technology',
      size: 500
    });

    expect(org.id).toBeDefined();
    expect(org.name).toBe('Acme Corp');
    expect(org.cnpj).toBe('12345678000195');
    expect(org.website).toBe('https://acme.com');
  });
});
