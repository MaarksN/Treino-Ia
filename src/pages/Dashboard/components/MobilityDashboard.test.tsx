import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { MobilityDashboard } from './MobilityDashboard';

describe('MobilityDashboard', () => {
  it('renders correctly and saves manual log', () => {
    render(<MobilityDashboard />);
    expect(screen.getByText(/Mobilidade Articular \(Item 88\)/i)).toBeInTheDocument();

    // Check save functionality
    fireEvent.change(screen.getByLabelText(/Pontuação/i), { target: { value: 8 } });
    fireEvent.change(screen.getByLabelText(/Notas/i), { target: { value: 'Melhorou muito' } });
    fireEvent.click(screen.getByText(/Salvar/i));

    expect(screen.getAllByText(/Ombro/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/8\/10/i)).toBeInTheDocument();
    expect(screen.getByText(/- Melhorou muito/i)).toBeInTheDocument();
  });

  it('triggers camera guard alert', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<MobilityDashboard />);
    fireEvent.click(screen.getByText(/Tentar Escanear pela Câmera/i));

    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Erro de permissão'));
    alertMock.mockRestore();
  });
});
