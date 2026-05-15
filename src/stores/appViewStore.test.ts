import { describe, it, expect } from 'vitest';
import { useAppViewStore } from './appViewStore';

describe('appViewStore', () => {
  it('should toggle dark mode', () => {
    useAppViewStore.setState({ darkMode: true });
    expect(useAppViewStore.getState().darkMode).toBe(true);

    useAppViewStore.getState().setDarkMode(false);
    expect(useAppViewStore.getState().darkMode).toBe(false);
  });

  it('should change language', () => {
    useAppViewStore.setState({ language: 'PT' });
    expect(useAppViewStore.getState().language).toBe('PT');

    useAppViewStore.getState().setLanguage('EN');
    expect(useAppViewStore.getState().language).toBe('EN');
  });
});
