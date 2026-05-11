import { describe, expect, it } from 'vitest';
import {
  createGroupInviteUrl,
  createInviteCode,
  createPublicProfileUrl,
  createUsernameSlug,
  getInviteCodeFromPath,
  getUsernameFromPath,
  requireSocialText,
  validateUsername,
} from './socialUtils';

describe('socialUtils', () => {
  it('normalizes usernames into safe slugs', () => {
    expect(createUsernameSlug(' João Silva!! ')).toBe('joao_silva');
    expect(createUsernameSlug('ab')).toBe('');
    expect(validateUsername('Atleta_123')).toBe('atleta_123');
  });

  it('rejects empty social text', () => {
    expect(() => requireSocialText('   ', 'Título')).toThrow('Título é obrigatório.');
  });

  it('creates private invite codes with a stable group prefix', () => {
    expect(createInviteCode('Equipe Força')).toMatch(/^equipefo-[a-z0-9]{8}$/);
  });

  it('parses public profile and invite routes', () => {
    expect(getUsernameFromPath('/u/atleta_01')).toBe('atleta_01');
    expect(getInviteCodeFromPath('/groups/join/equipe-abc123')).toBe('equipe-abc123');
  });

  it('builds shareable absolute URLs', () => {
    expect(createPublicProfileUrl('ana')).toContain('/u/ana');
    expect(createGroupInviteUrl('grupo-123')).toContain('/groups/join/grupo-123');
  });
});
