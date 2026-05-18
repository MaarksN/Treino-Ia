import { describe, expect, it } from 'vitest';
import { decryptOAuthToken, encryptOAuthToken } from './oauthTokenCrypto';

describe('oauthTokenCrypto', () => {
  it('encrypts and decrypts token payloads', () => {
    process.env.HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
    const encrypted = encryptOAuthToken('token-abc');
    expect(encrypted.startsWith('enc:v1:')).toBe(true);
    expect(decryptOAuthToken(encrypted)).toBe('token-abc');
  });

  it('keeps legacy plaintext token values readable', () => {
    process.env.HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
    expect(decryptOAuthToken('legacy-token')).toBe('legacy-token');
  });
});
