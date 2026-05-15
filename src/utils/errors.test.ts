import { describe, expect, it } from 'vitest';
import { getErrorMessage, toError } from './errors';

describe('errors', () => {
  it('uses Error messages when available', () => {
    expect(getErrorMessage(new Error('Falha real'), 'Fallback')).toBe('Falha real');
  });

  it('falls back for empty or unknown errors', () => {
    expect(getErrorMessage(undefined, 'Fallback')).toBe('Fallback');
    expect(getErrorMessage({ message: '' }, 'Fallback')).toBe('Fallback');
  });

  it('wraps non-Error values with cause', () => {
    const original = { message: 'Falha externa' };
    const wrapped = toError(original, 'Fallback');

    expect(wrapped).toBeInstanceOf(Error);
    expect(wrapped.message).toBe('Falha externa');
    expect(wrapped.cause).toBe(original);
  });
});
