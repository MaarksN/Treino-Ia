import { describe, it, expect } from 'vitest';
import { Lead } from './Lead';

describe('Lead Entity', () => {
  it('should create a valid Lead', () => {
    const lead = Lead.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+1 555-0123',
      organizationId: 'org-123'
    });

    expect(lead.id).toBeDefined();
    expect(lead.firstName).toBe('Jane');
    expect(lead.status).toBe('new');
    expect(lead.score).toBe(0);
  });

  it('should update status to qualified when score becomes hot', () => {
    const lead = Lead.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    });

    lead.qualify(85);
    expect(lead.score).toBe(85);
    expect(lead.status).toBe('qualified');
  });
});
