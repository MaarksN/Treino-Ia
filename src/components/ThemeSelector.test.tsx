import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSelector } from './ThemeSelector';
import * as themeUtils from '../utils/themeUtils';

vi.mock('../utils/themeUtils', () => ({
  APP_THEMES: [
    { id: 'light', name: 'Light Mode', description: 'Bright theme', isPremium: false, emoji: '☀️', vars: { '--color-brand-dark': '#fff', '--color-brand-neon': '#000' } },
    { id: 'dark-pro', name: 'Dark Pro', description: 'Dark theme', isPremium: true, emoji: '🌙', vars: { '--color-brand-dark': '#000', '--color-brand-neon': '#fff' } }
  ],
  applyTheme: vi.fn(),
  getThemeAccess: vi.fn(),
  loadThemeId: vi.fn().mockReturnValue('light')
}));

describe('ThemeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders available themes', () => {
    vi.mocked(themeUtils.getThemeAccess).mockReturnValue({ allowed: true });

    render(<ThemeSelector />);
    
    expect(screen.getByText('Temas')).toBeInTheDocument();
    expect(screen.getByText('Light Mode')).toBeInTheDocument();
    expect(screen.getByText('Dark Pro')).toBeInTheDocument();
  });

  it('shows locked state for premium themes when user is not premium', () => {
    vi.mocked(themeUtils.getThemeAccess).mockImplementation((id, isPremium) => {
      return { allowed: isPremium || id === 'light' };
    });

    render(<ThemeSelector isPremium={false} />);
    
    const premiumBtn = screen.getByText('Dark Pro').closest('button');
    expect(premiumBtn).toHaveAttribute('aria-disabled', 'true');
    expect(premiumBtn).toHaveClass('opacity-60');
  });

  it('calls applyTheme and onThemeChange when a theme is selected', () => {
    vi.mocked(themeUtils.getThemeAccess).mockReturnValue({ allowed: true });
    vi.mocked(themeUtils.applyTheme).mockReturnValue({ applied: true, theme: themeUtils.APP_THEMES[0] });
    
    const mockOnChange = vi.fn();
    render(<ThemeSelector isPremium={true} onThemeChange={mockOnChange} />);
    
    const themeBtn = screen.getByText('Dark Pro').closest('button')!;
    fireEvent.click(themeBtn);
    
    expect(themeUtils.applyTheme).toHaveBeenCalledWith('dark-pro', { enforcePremium: true, isPremium: true });
    expect(mockOnChange).toHaveBeenCalledWith('dark-pro');
  });

  it('shows blocked message if applyTheme fails (e.g. server validation)', () => {
    vi.mocked(themeUtils.getThemeAccess).mockReturnValue({ allowed: true });
    vi.mocked(themeUtils.applyTheme).mockReturnValue({ applied: false, theme: themeUtils.APP_THEMES[1] });
    
    render(<ThemeSelector isPremium={false} />);
    
    const themeBtn = screen.getByText('Dark Pro').closest('button')!;
    fireEvent.click(themeBtn);
    
    expect(screen.getByText(/requer assinatura premium ativa/i)).toBeInTheDocument();
  });
});
