import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { onAuthStateChange } from '../services/authService';
import { useAuthState } from './useAuthState';

vi.mock('../services/authService', () => ({
  onAuthStateChange: vi.fn(),
}));

describe('useAuthState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refreshes the session on sign in and token refresh events', () => {
    const unsubscribe = vi.fn();
    let authCallback: Parameters<typeof onAuthStateChange>[0] | undefined;
    vi.mocked(onAuthStateChange).mockImplementation((callback) => {
      authCallback = callback;
      return unsubscribe;
    });

    const onSessionRefresh = vi.fn();
    renderHook(() => useAuthState({ onSessionRefresh }));

    expect(onAuthStateChange).toHaveBeenCalledTimes(1);

    act(() => {
      authCallback?.('SIGNED_IN', null);
      authCallback?.('TOKEN_REFRESHED', null);
    });

    expect(onSessionRefresh).toHaveBeenCalledTimes(2);
  });

  it('ignores auth events that do not require a session refresh', () => {
    let authCallback: Parameters<typeof onAuthStateChange>[0] | undefined;
    vi.mocked(onAuthStateChange).mockImplementation((callback) => {
      authCallback = callback;
      return vi.fn();
    });

    const onSessionRefresh = vi.fn();
    renderHook(() => useAuthState({ onSessionRefresh }));

    act(() => {
      authCallback?.('SIGNED_OUT', null);
      authCallback?.('USER_UPDATED', null);
    });

    expect(onSessionRefresh).not.toHaveBeenCalled();
  });

  it('unsubscribes from auth changes on unmount', () => {
    const unsubscribe = vi.fn();
    vi.mocked(onAuthStateChange).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useAuthState({ onSessionRefresh: vi.fn() }));

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
