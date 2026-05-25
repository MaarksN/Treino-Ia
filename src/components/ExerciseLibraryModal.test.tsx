import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';

const CUSTOM_EXERCISES_KEY = '@TreinoApp:customExercises';
const FAVORITES_KEY = '@TreinoApp:favExercises';

describe('ExerciseLibraryModal', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the exercise library and closes through the modal action', () => {
    const onClose = vi.fn();

    renderWithProviders(<ExerciseLibraryModal onClose={onClose} />);

    expect(screen.getByRole('heading', { name: /biblioteca de exercícios/i })).toBeInTheDocument();
    expect(screen.getByText('Supino Reto com Barra')).toBeInTheDocument();
    expect(screen.getByText('Agachamento Livre')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /vídeo/i })[0]).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    );

    fireEvent.click(screen.getAllByRole('button')[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('filters by search text and shows the empty state when no exercise matches', () => {
    renderWithProviders(<ExerciseLibraryModal onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/buscar exercício/i), {
      target: { value: 'bench press' },
    });

    expect(screen.getByText('Supino Reto com Barra')).toBeInTheDocument();
    expect(screen.queryByText('Agachamento Livre')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/buscar exercício/i), {
      target: { value: 'sem-match' },
    });

    expect(screen.getByText('Nenhum exercício encontrado.')).toBeInTheDocument();
  });

  it('persists favorites and limits the list to favorite exercises', () => {
    renderWithProviders(<ExerciseLibraryModal onClose={vi.fn()} />);

    fireEvent.click(screen.getAllByTitle('Favoritar')[0]);
    fireEvent.click(screen.getByRole('button', { name: /favoritos/i }));

    expect(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')).toEqual(['e001']);
    expect(screen.getByText('Supino Reto com Barra')).toBeInTheDocument();
    expect(screen.queryByText('Agachamento Livre')).not.toBeInTheDocument();
  });

  it('creates a custom exercise and stores its tags locally', () => {
    renderWithProviders(<ExerciseLibraryModal onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /criar exercício/i }));
    fireEvent.change(screen.getByPlaceholderText('Nome'), {
      target: { value: 'Remada landmine' },
    });
    fireEvent.change(screen.getByPlaceholderText('Grupo muscular'), {
      target: { value: 'Costas' },
    });
    fireEvent.change(screen.getByPlaceholderText('Padrão de movimento'), {
      target: { value: 'Puxar Horizontal' },
    });
    fireEvent.change(screen.getByPlaceholderText(/tags/i), {
      target: { value: 'costas, unilateral, barra' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    expect(screen.getByText('Remada landmine')).toBeInTheDocument();
    expect(screen.getByText('custom')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(CUSTOM_EXERCISES_KEY) || '[]')).toEqual([
      expect.objectContaining({
        id: '00000000-0000-4000-8000-000000000001',
        name: 'Remada landmine',
        muscleGroup: 'Costas',
        movementPattern: 'Puxar Horizontal',
        tags: ['costas', 'unilateral', 'barra'],
        isCustom: true,
      }),
    ]);
  });
});
