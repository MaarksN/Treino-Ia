import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import { PeriodicTable } from './PeriodicTable';

describe('PeriodicTable', () => {
  it('renders correctly and shows instruction', () => {
    render(<PeriodicTable />);
    expect(screen.getByText(/Tabela Periódica Nutricional \(Item 90\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecione um micronutriente/i)).toBeInTheDocument();
  });

  it('shows nutrient details on click', () => {
    render(<PeriodicTable />);

    // Click on 'Fe' (Ferro)
    fireEvent.click(screen.getByText('Fe'));

    expect(screen.getByText(/Ferro \(Fe\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Transporte de oxigênio/i)).toBeInTheDocument();
  });
});
