import { describe, it, expect, vi } from 'vitest';
import { runAiTask } from './aiGateway';

vi.mock('../geminiProxyClient', () => ({
  createGeminiProxyClient: () => ({
    models: { generateContent: vi.fn().mockResolvedValue({ text: '{"ok":true}' }) },
  }),
}));

describe('aiGateway', () => {
  it('returns typed success', async () => {
    const res = await runAiTask('x', { taskType: 'generic', promptVersion: 'generic-v1', modelPolicy: 'default' }, (v): v is { ok: boolean } => Boolean(v) && typeof v === 'object' && typeof (v as { ok?: unknown }).ok === 'boolean');
    expect(res.ok).toBe(true);
  });
});
