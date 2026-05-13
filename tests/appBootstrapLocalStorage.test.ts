import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('App bootstrap does not restore critical state from localStorage', () => {
  const appSource = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf-8');

  it('does not read critical keys in bootstrap', () => {
    expect(appSource).not.toContain("localStorage.getItem('@TreinoApp:user')");
    expect(appSource).not.toContain("localStorage.getItem('@TreinoApp:plans')");
    expect(appSource).not.toContain("localStorage.getItem('@TreinoApp:history')");
    expect(appSource).not.toContain("localStorage.getItem('@TreinoApp:profile')");
    expect(appSource).not.toContain("localStorage.getItem('@TreinoApp:sessions')");
    expect(appSource).not.toContain("localStorage.getItem('@TreinoApp:recovery')");
  });

  it('keeps only non-sensitive local preferences', () => {
    expect(appSource).toContain("localStorage.getItem('@TreinoApp:theme')");
    expect(appSource).toContain("localStorage.getItem(ONBOARDING_KEY)");
  });
});
