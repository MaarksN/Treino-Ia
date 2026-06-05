import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { ImportWorkoutView } from './ImportWorkoutView';

function renderImportView(overrides: Partial<Parameters<typeof ImportWorkoutView>[0]> = {}) {
  const onImport = vi.fn().mockResolvedValue(undefined);
  const onCancel = vi.fn();

  const view = renderWithProviders(
    <ImportWorkoutView onImport={onImport} onCancel={onCancel} isLoading={false} {...overrides} />,
  );

  return { ...view, onImport, onCancel };
}

function selectFile(container: HTMLElement, file: File) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

describe('ImportWorkoutView', () => {
  it('renders the local import controls and routes the close action', () => {
    const { onImport, onCancel } = renderImportView();

    expect(screen.getByRole('heading', { name: /imagem ou pdf/i })).toBeInTheDocument();
    expect(screen.getByText(/jpg, png, webp ou pdf até 12 mb/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /selecionar arquivo/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /preparar arquivo/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /fechar/i }));

    expect(onImport).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('prepares a PDF draft with normalized crop data and calls the import callback', async () => {
    const { container, onImport } = renderImportView();
    const file = new File(['pdf-content'], 'ficha-upper.pdf', { type: 'application/pdf' });

    selectFile(container, file);

    expect(await screen.findByText('ficha-upper.pdf')).toBeInTheDocument();
    expect(screen.getByText(/arquivo aceito para preparo local com crop/i)).toBeInTheDocument();

    fireEvent.change(screen.getAllByRole('slider')[2], { target: { value: '35' } });
    fireEvent.click(screen.getByRole('button', { name: /preparar arquivo/i }));

    await waitFor(() => expect(onImport).toHaveBeenCalledTimes(1));
    expect(onImport).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'ficha-upper.pdf',
        mimeType: 'application/pdf',
        status: 'ready',
        ocrStatus: 'not_started',
        crop: expect.objectContaining({ width: 35 }),
        warnings: expect.arrayContaining([
          'PDF recebe crop como metadado local; rasterizacao de pagina nao foi simulada.',
        ]),
      }),
    );
  });

  it('shows blocked guard feedback and forwards blocked drafts for unsupported files', async () => {
    const { container, onImport } = renderImportView();
    const file = new File(['plain text'], 'treino.txt', { type: 'text/plain' });

    selectFile(container, file);

    expect(await screen.findByText('treino.txt')).toBeInTheDocument();
    expect(screen.getAllByText(/formato nao suportado/i)).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: /preparar arquivo/i }));

    await waitFor(() => expect(onImport).toHaveBeenCalledTimes(1));
    expect(onImport).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'treino.txt',
        mimeType: 'text/plain',
        status: 'blocked',
        warnings: expect.arrayContaining([
          'Formato nao suportado. Use imagem JPG, PNG, WebP ou PDF.',
        ]),
      }),
    );
    expect(
      screen.getAllByText('Formato nao suportado. Use imagem JPG, PNG, WebP ou PDF.'),
    ).toHaveLength(2);
  });

  it('renders the loading fallback without exposing file selection actions', () => {
    renderImportView({ isLoading: true });

    expect(screen.getByText('Preparando arquivo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /selecionar arquivo/i })).not.toBeInTheDocument();
  });
});
