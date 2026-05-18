import { describe, it, expect } from 'vitest';
import { getPromptRegistry } from './aiPromptRegistry';

describe('aiPromptRegistry', () => {
  it('has prompt versions by task', () => {
    expect(getPromptRegistry('personalization').promptVersion).toContain('v1');
  });
});
