import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ConnectivityBanner } from './ConnectivityBanner';
import { getOfflineQueueCount } from '../utils/offlineQueue';
import { syncOfflineQueue } from '../utils/syncUtils';

vi.mock('../utils/offlineQueue', () => ({
  getOfflineQueueCount: vi.fn(),
}));

vi.mock('../utils/syncUtils', () => ({
  syncOfflineQueue: vi.fn(),
}));

describe('ConnectivityBanner', () => {
  let originalOnLine: boolean;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOfflineQueueCount).mockResolvedValue(0);

    // Save original property and mock it to true by default
    originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: originalOnLine,
    });
  });

  it('renders online state with 0 pending items', async () => {
    await act(async () => {
      render(<ConnectivityBanner />);
    });

    expect(screen.getByText('Online - sincronizacao ativa')).toBeInTheDocument();
    expect(screen.getByText('0 pendente(s)')).toBeInTheDocument();
  });

  it('renders offline state when navigator is offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });

    vi.mocked(getOfflineQueueCount).mockResolvedValue(5);

    await act(async () => {
      render(<ConnectivityBanner />);
    });

    expect(screen.getByText('Offline - acoes salvas na fila local')).toBeInTheDocument();
    expect(screen.getByText('5 pendente(s)')).toBeInTheDocument();
  });

  it('updates state when offline event is fired', async () => {
    await act(async () => {
      render(<ConnectivityBanner />);
    });

    expect(screen.getByText('Online - sincronizacao ativa')).toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText('Offline - acoes salvas na fila local')).toBeInTheDocument();
  });

  it('updates state and syncs when online event is fired', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });

    await act(async () => {
      render(<ConnectivityBanner />);
    });

    expect(screen.getByText('Offline - acoes salvas na fila local')).toBeInTheDocument();

    // Trigger online event
    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.getByText('Online - sincronizacao ativa')).toBeInTheDocument();
    expect(syncOfflineQueue).toHaveBeenCalledTimes(1);
  });
});
