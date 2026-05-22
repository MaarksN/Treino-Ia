import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AppUpdateBanner } from './AppUpdateBanner';
import { listenForAppUpdate, reloadForUpdate } from '../utils/pwaUtils';

vi.mock('../utils/pwaUtils', () => ({
  listenForAppUpdate: vi.fn(),
  reloadForUpdate: vi.fn()
}));

describe('AppUpdateBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing initially when there is no update', () => {
    const { container } = render(<AppUpdateBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the banner when an update is available', () => {
    // Mock the listener to immediately trigger the callback
    vi.mocked(listenForAppUpdate).mockImplementationOnce((cb) => {
      cb();
      return () => {}; // return cleanup function
    });

    render(<AppUpdateBanner />);
    
    expect(screen.getByText('Nova versao disponivel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Atualizar agora/i })).toBeInTheDocument();
  });

  it('calls reloadForUpdate when update button is clicked', () => {
    vi.mocked(listenForAppUpdate).mockImplementationOnce((cb) => {
      cb();
      return () => {};
    });

    render(<AppUpdateBanner />);
    
    const updateButton = screen.getByRole('button', { name: /Atualizar agora/i });
    fireEvent.click(updateButton);
    
    expect(reloadForUpdate).toHaveBeenCalledTimes(1);
  });

  it('hides the banner when the close button is clicked', () => {
    vi.mocked(listenForAppUpdate).mockImplementationOnce((cb) => {
      cb();
      return () => {};
    });

    render(<AppUpdateBanner />);
    
    // Banner is visible
    expect(screen.getByText('Nova versao disponivel')).toBeInTheDocument();
    
    // Click close
    const closeButton = screen.getByRole('button', { name: /Fechar banner/i });
    fireEvent.click(closeButton);
    
    // Banner should be hidden
    expect(screen.queryByText('Nova versao disponivel')).not.toBeInTheDocument();
  });
});
