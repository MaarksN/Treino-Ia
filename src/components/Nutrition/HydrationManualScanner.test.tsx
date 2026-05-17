import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { HydrationManualScanner } from './HydrationManualScanner';

describe('HydrationManualScanner', () => {
  it('renders correctly with default ideal message', () => {
    render(<HydrationManualScanner />);
    expect(screen.getByText(/Avaliação de Hidratação \(Item 89\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Corrente amarela clara \(ideal\)/i)).toBeInTheDocument();
  });

  it('updates message when range is changed', () => {
    render(<HydrationManualScanner />);
    const rangeInput = screen.getByRole('slider');

    // Change to level 6 (Dark)
    fireEvent.change(rangeInput, { target: { value: 6 } });
    expect(screen.getByText(/Corrente escura \(Alerta\)/i)).toBeInTheDocument();
  });

  it('triggers camera guard alert', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<HydrationManualScanner />);
    fireEvent.click(screen.getByText(/Tentar Escanear pela Câmera/i));

    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('bloqueado (Item 89 Guard)'));
    alertMock.mockRestore();
  });
});
