import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import { MicrobiotaWidget } from './MicrobiotaWidget';

describe('MicrobiotaWidget', () => {
  it('renders educational message when data is provided', () => {
    render(<MicrobiotaWidget dailyFiberGrams={30} calories={2000} />);
    expect(screen.getByText(/Microbiota e Fibras \(Educacional\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingestão atual: 30g/i)).toBeInTheDocument();
  });

  it('renders unknown state message for 0 calories', () => {
    render(<MicrobiotaWidget dailyFiberGrams={0} calories={0} />);
    expect(screen.getByText(/Sem dados nutricionais suficientes/i)).toBeInTheDocument();
  });
});
