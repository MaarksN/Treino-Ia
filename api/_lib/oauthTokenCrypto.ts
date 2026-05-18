import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { HttpError } from './http';

const KEY_ENV = 'HEALTH_OAUTH_TOKEN_ENCRYPTION_KEY';
const PREFIX = 'enc:v1:';

function getKey(): Buffer {
  const raw = process.env[KEY_ENV] || '';
  if (!raw) throw new HttpError(500, `${KEY_ENV} is not configured`);

  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new HttpError(500, `${KEY_ENV} must be a base64-encoded 32-byte key`);
  }

  return key;
}

export function encryptOAuthToken(token: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${Buffer.concat([iv, tag, ciphertext]).toString('base64')}`;
}

export function decryptOAuthToken(token: string): string {
  if (!token.startsWith(PREFIX)) return token;

  const key = getKey();
  const payload = Buffer.from(token.slice(PREFIX.length), 'base64');
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const ciphertext = payload.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
