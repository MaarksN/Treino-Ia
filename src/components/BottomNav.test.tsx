import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNav, type BottomNavItem } from './BottomNav';

/**
 * BottomNav Component Test — Controlled Technical Sprint 05.
 *
 * Tests the mobile bottom navigation bar:
 *   1. Renders default items with correct labels.
 *   2. Renders custom items when provided.
 *   3. Highlights the active item.
 *   4. Calls onChange when an item is clicked.
 *   5. Has accessible navigation landmark.
 *
 * Constraints:
 *   - No API calls, no OAuth, no secrets.
 *   - Pure presentational component — deterministic.
 */

describe('BottomNav', () => {
  it('renders default navigation items', () => {
    render(<BottomNav />);

    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Treino')).toBeInTheDocument();
    expect(screen.getByText('Progresso')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('renders custom items when provided', () => {
    const items: BottomNavItem[] = [
      { id: 'overview', label: 'Visão Geral', icon: 'home' },
      { id: 'nutrition', label: 'Nutrição', icon: 'nutrition' },
    ];

    render(<BottomNav items={items} />);

    expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    expect(screen.getByText('Nutrição')).toBeInTheDocument();
    // Default items should NOT be present
    expect(screen.queryByText('Treino')).not.toBeInTheDocument();
  });

  it('has accessible navigation landmark', () => {
    render(<BottomNav />);

    const nav = screen.getByRole('navigation', { name: /navegação móvel/i });
    expect(nav).toBeInTheDocument();
  });

  it('renders all items as buttons', () => {
    render(<BottomNav />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('calls onChange with item id when clicked', () => {
    const handleChange = vi.fn();
    render(<BottomNav onChange={handleChange} />);

    fireEvent.click(screen.getByText('Treino'));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('workout');
  });

  it('applies active styling to the active item', () => {
    const { container } = render(<BottomNav activeId="workout" />);

    // The active button should have the neon color class
    const workoutButton = screen.getByText('Treino').closest('button');
    expect(workoutButton?.className).toContain('text-brand-neon');

    // Non-active button should NOT have neon class
    const homeButton = screen.getByText('Início').closest('button');
    expect(homeButton?.className).not.toContain('text-brand-neon');
  });
});
