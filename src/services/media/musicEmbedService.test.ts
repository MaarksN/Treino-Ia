import { describe, expect, it } from 'vitest';
import { createSafeMusicEmbed } from './musicEmbedService';

describe('musicEmbedService', () => {
  it('rejects raw HTML embeds', () => {
    const result = createSafeMusicEmbed('<iframe src="https://www.youtube.com/embed/abc123XYZ"></iframe>');

    expect(result.ok).toBe(false);
    expect(result.error).toContain('HTML');
  });

  it('rejects javascript URLs', () => {
    const result = createSafeMusicEmbed('javascript:alert(1)');

    expect(result.ok).toBe(false);
  });

  it('rejects providers outside the allowlist', () => {
    const result = createSafeMusicEmbed('https://evil.example.com/embed/song');

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Provedor');
  });

  it('accepts valid YouTube watch URLs', () => {
    const result = createSafeMusicEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    expect(result.ok).toBe(true);
    expect(result.embed?.provider).toBe('youtube');
    expect(result.embed?.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('accepts valid Spotify URLs', () => {
    const result = createSafeMusicEmbed('https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7bg?si=test');

    expect(result.ok).toBe(true);
    expect(result.embed?.provider).toBe('spotify');
    expect(result.embed?.src).toBe('https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7bg?utm_source=generator');
  });

  it('accepts valid SoundCloud URLs', () => {
    const result = createSafeMusicEmbed('https://soundcloud.com/artist/song-name');

    expect(result.ok).toBe(true);
    expect(result.embed?.provider).toBe('soundcloud');
    expect(result.embed?.src).toContain('https://w.soundcloud.com/player/');
    expect(result.embed?.src).toContain('url=https%3A%2F%2Fsoundcloud.com%2Fartist%2Fsong-name');
  });

  it('generates iframe props with a safe HTTPS src', () => {
    const result = createSafeMusicEmbed('https://youtu.be/dQw4w9WgXcQ');

    expect(result.embed).toMatchObject({
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      sandbox: expect.stringContaining('allow-scripts'),
      referrerPolicy: 'strict-origin-when-cross-origin',
      title: 'YouTube music player',
    });
    expect(result.embed?.src.startsWith('https://')).toBe(true);
    expect(result.embed?.src).not.toContain('javascript:');
    expect(result.embed).not.toHaveProperty('srcdoc');
  });
});
