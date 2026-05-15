import { describe, it, expect } from 'vitest';
import { getErrorMessage, toSafeUserMessage } from './errors';

describe('errors utils', () => {
  it('should extract message from Error object', () => {
    const error = new Error('Test error');
    expect(getErrorMessage(error)).toBe('Test error');
  });

  it('should return string directly if error is a string', () => {
    expect(getErrorMessage('String error')).toBe('String error');
  });

  it('should return fallback message for unknown types', () => {
    expect(getErrorMessage({ code: 500 })).toBe('Unexpected error.');
  });

  it('should return a safe user message', () => {
    expect(toSafeUserMessage(new Error('Secret API key failed'))).toBe('Não foi possível concluir a ação agora. Tente novamente.');
  });
});
