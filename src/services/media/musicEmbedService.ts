export type MusicProvider = 'youtube' | 'spotify' | 'soundcloud';

export interface SafeMusicEmbed {
  provider: MusicProvider;
  src: string;
  title: string;
  allow: string;
  sandbox: string;
  referrerPolicy: 'strict-origin-when-cross-origin';
}

export interface MusicEmbedValidationResult {
  ok: boolean;
  embed?: SafeMusicEmbed;
  error?: string;
}

const HTTPS_PROTOCOL = 'https:';
const IFRAME_ALLOW = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
const IFRAME_SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-forms allow-presentation';
const REFERRER_POLICY = 'strict-origin-when-cross-origin';

const SPOTIFY_EMBED_TYPES = new Set(['album', 'episode', 'playlist', 'show', 'track']);
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);
const SPOTIFY_HOSTS = new Set(['open.spotify.com']);
const SOUNDCLOUD_HOSTS = new Set(['soundcloud.com', 'www.soundcloud.com']);
const SOUNDCLOUD_EMBED_HOSTS = new Set(['w.soundcloud.com']);

function fail(error: string): MusicEmbedValidationResult {
  return { ok: false, error };
}

function safeEmbed(provider: MusicProvider, src: string, title: string): MusicEmbedValidationResult {
  return {
    ok: true,
    embed: {
      provider,
      src,
      title,
      allow: IFRAME_ALLOW,
      sandbox: IFRAME_SANDBOX,
      referrerPolicy: REFERRER_POLICY,
    },
  };
}

function parseHttpsUrl(input: string): URL | null {
  const trimmed = input.trim();

  if (!trimmed || /<[^>]+>/.test(trimmed)) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === HTTPS_PROTOCOL ? url : null;
  } catch {
    return null;
  }
}

function sanitizeId(value: string | null): string | null {
  if (!value) return null;

  const decoded = decodeURIComponent(value).trim();
  return /^[A-Za-z0-9_-]{6,128}$/.test(decoded) ? decoded : null;
}

function buildYouTubeEmbed(url: URL): MusicEmbedValidationResult | null {
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;

  const playlistId = sanitizeId(url.searchParams.get('list'));
  if (playlistId) {
    return safeEmbed(
      'youtube',
      `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}`,
      'YouTube playlist player',
    );
  }

  let videoId: string | null = null;

  if (url.hostname === 'youtu.be' || url.hostname === 'www.youtu.be') {
    videoId = sanitizeId(url.pathname.split('/').filter(Boolean)[0] ?? null);
  } else if (url.pathname === '/watch') {
    videoId = sanitizeId(url.searchParams.get('v'));
  } else {
    const parts = url.pathname.split('/').filter(Boolean);
    const embedIndex = parts.findIndex(part => part === 'embed' || part === 'shorts' || part === 'live');
    if (embedIndex >= 0) {
      videoId = sanitizeId(parts[embedIndex + 1] ?? null);
    }
  }

  if (!videoId) {
    return fail('URL do YouTube invalida ou sem video/playlist reconhecida.');
  }

  return safeEmbed(
    'youtube',
    `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`,
    'YouTube music player',
  );
}

function buildSpotifyEmbed(url: URL): MusicEmbedValidationResult | null {
  if (!SPOTIFY_HOSTS.has(url.hostname)) return null;

  const parts = url.pathname.split('/').filter(Boolean);
  const embedOffset = parts[0] === 'embed' ? 1 : 0;
  const type = parts[embedOffset];
  const id = sanitizeId(parts[embedOffset + 1] ?? null);

  if (!type || !SPOTIFY_EMBED_TYPES.has(type) || !id) {
    return fail('URL do Spotify invalida. Use album, episode, playlist, show ou track.');
  }

  return safeEmbed(
    'spotify',
    `https://open.spotify.com/embed/${type}/${encodeURIComponent(id)}?utm_source=generator`,
    'Spotify music player',
  );
}

function buildSoundCloudEmbed(url: URL): MusicEmbedValidationResult | null {
  if (SOUNDCLOUD_EMBED_HOSTS.has(url.hostname)) {
    const embeddedUrl = parseHttpsUrl(url.searchParams.get('url') ?? '');

    if (!embeddedUrl || !SOUNDCLOUD_HOSTS.has(embeddedUrl.hostname)) {
      return fail('Embed do SoundCloud precisa apontar para uma URL publica do SoundCloud.');
    }

    return safeEmbed('soundcloud', url.toString(), 'SoundCloud music player');
  }

  if (!SOUNDCLOUD_HOSTS.has(url.hostname)) return null;

  const pathParts = url.pathname.split('/').filter(Boolean);
  if (pathParts.length < 2) {
    return fail('URL do SoundCloud invalida ou incompleta.');
  }

  const publicUrl = `https://${url.hostname}${url.pathname}`;
  const embedUrl = new URL('https://w.soundcloud.com/player/');
  embedUrl.searchParams.set('url', publicUrl);
  embedUrl.searchParams.set('auto_play', 'false');
  embedUrl.searchParams.set('hide_related', 'false');
  embedUrl.searchParams.set('show_comments', 'false');
  embedUrl.searchParams.set('show_user', 'true');
  embedUrl.searchParams.set('show_reposts', 'false');
  embedUrl.searchParams.set('show_teaser', 'true');
  embedUrl.searchParams.set('visual', 'true');

  return safeEmbed('soundcloud', embedUrl.toString(), 'SoundCloud music player');
}

export function createSafeMusicEmbed(input: string): MusicEmbedValidationResult {
  const url = parseHttpsUrl(input);

  if (!url) {
    return fail('Cole uma URL HTTPS valida. HTML, srcdoc, javascript: e embeds brutos nao sao aceitos.');
  }

  const result =
    buildYouTubeEmbed(url) ??
    buildSpotifyEmbed(url) ??
    buildSoundCloudEmbed(url);

  if (!result) {
    return fail('Provedor nao permitido. Use YouTube, Spotify ou SoundCloud.');
  }

  return result;
}
