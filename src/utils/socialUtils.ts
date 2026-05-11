const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 24;
const SOCIAL_TEXT_MAX_LENGTH = 2000;

function getOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'https://treino.app';
}

function randomBase36(length: number): string {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  const bytes = new Uint8Array(length);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, value => alphabet[value % alphabet.length]).join('');
}

export function sanitizeSocialText(value: string, maxLength = SOCIAL_TEXT_MAX_LENGTH): string {
  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function createUsernameSlug(value: string): string {
  const slug = sanitizeSocialText(value, USERNAME_MAX_LENGTH * 2)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, USERNAME_MAX_LENGTH)
    .replace(/^_+|_+$/g, '');

  return slug.length >= USERNAME_MIN_LENGTH ? slug : '';
}

export function validateUsername(value: string): string {
  const username = createUsernameSlug(value);

  if (!username) {
    throw new Error('Username deve ter pelo menos 3 caracteres usando letras, números ou underscore.');
  }

  return username;
}

export function requireSocialText(value: string, fieldLabel: string, maxLength = SOCIAL_TEXT_MAX_LENGTH): string {
  const text = sanitizeSocialText(value, maxLength);

  if (!text) {
    throw new Error(`${fieldLabel} é obrigatório.`);
  }

  return text;
}

export function createInviteCode(groupName: string): string {
  const base = createUsernameSlug(groupName).replace(/_/g, '').slice(0, 8) || 'grupo';
  return `${base}-${randomBase36(8)}`;
}

export function normalizeInviteCode(inviteCode: string): string {
  return sanitizeSocialText(inviteCode, 48).toLowerCase();
}

export function createPublicProfileUrl(username: string): string {
  return `${getOrigin()}/u/${encodeURIComponent(username)}`;
}

export function createGroupInviteUrl(inviteCode: string): string {
  return `${getOrigin()}/groups/join/${encodeURIComponent(inviteCode)}`;
}

export function getInviteCodeFromPath(pathname = typeof window !== 'undefined' ? window.location.pathname : ''): string | null {
  const match = pathname.match(/^\/groups\/join\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getUsernameFromPath(pathname = typeof window !== 'undefined' ? window.location.pathname : ''): string | null {
  const match = pathname.match(/^\/u\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function formatSocialNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}m`;
}
