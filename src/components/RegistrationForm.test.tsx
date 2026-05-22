import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RegistrationForm } from './RegistrationForm';

describe('RegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders initial form fields correctly', () => {
    render(<RegistrationForm onRegister={vi.fn()} />);
    
    expect(screen.getByText('INICIAR')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: João da Silva')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('joao@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cadastrar e continuar/i })).toBeInTheDocument();
  });

  it('updates input values when typing', () => {
    render(<RegistrationForm onRegister={vi.fn()} />);
    
    const nameInput = screen.getByPlaceholderText('Ex: João da Silva');
    const emailInput = screen.getByPlaceholderText('joao@example.com');

    fireEvent.change(nameInput, { target: { value: 'Maria' } });
    fireEvent.change(emailInput, { target: { value: 'maria@example.com' } });

    expect(nameInput).toHaveValue('Maria');
    expect(emailInput).toHaveValue('maria@example.com');
  });

  it('calls onRegister and saves to localStorage on submit', () => {
    const mockOnRegister = vi.fn();
    render(<RegistrationForm onRegister={mockOnRegister} />);
    
    const nameInput = screen.getByPlaceholderText('Ex: João da Silva');
    const emailInput = screen.getByPlaceholderText('joao@example.com');
    const submitButton = screen.getByRole('button', { name: /Cadastrar e continuar/i });

    fireEvent.change(nameInput, { target: { value: 'Carlos Silva' } });
    fireEvent.change(emailInput, { target: { value: 'carlos@example.com' } });
    
    fireEvent.click(submitButton);

    // Verify callback
    expect(mockOnRegister).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Carlos Silva',
      email: 'carlos@example.com',
    }));

    // Verify localStorage
    const saved = JSON.parse(localStorage.getItem('@TreinoIA:starterUser') || '{}');
    expect(saved.name).toBe('Carlos Silva');
    expect(saved.email).toBe('carlos@example.com');
    expect(saved.createdAt).toBeDefined();
  });
});
